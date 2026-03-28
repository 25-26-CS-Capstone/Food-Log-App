import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const LAST_SYNC_KEY = 'last_sync_timestamp';
const SOFT_DELETE_TABLES = ['food_log', 'symptom_log'];

const toSnakeCase = (entry: any) => {
  if (!entry) return {};
  return {
    food_name:    entry.foodName     ?? entry.food_name   ?? null,
    meal_type:    entry.mealType     ?? entry.meal_type   ?? null,
    date_time:    entry.date_time    ?? null,
    servings:     entry.servings     ?? null,
    calories:     entry.calories     ?? null,
    color:        entry.color        ?? null,
    product_code: entry.product_code ?? null,
    brand:        entry.brand        ?? null,
    ingredients:  entry.ingredients  ?? null,
    allergens:    entry.allergens    ?? [],
  };
};

export interface SyncLog {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

// ============================================
// PUSH LOCAL CHANGES TO SUPABASE
// ============================================
export const syncLocalChangesToSupabase = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get pending changes from local queue
    const pendingChanges = await getPendingChanges();
    
    for (const change of pendingChanges) {
      await syncSingleChange(change, user.id);
    }

    console.log('✓ Local changes synced to Supabase');
  } catch (err) {
    console.error('Error syncing local changes:', err);
  }
};

// ============================================
// PULL CHANGES FROM SUPABASE TO LOCAL
// ============================================
export const syncSupabaseChangesToLocal = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const lastSync = await getLastSyncTime();

    // Pull food logs
    await syncTable('food_log', user.id, lastSync);

    // Pull symptom logs
    await syncTable('symptom_log', user.id, lastSync);

    // Pull user profile
    await syncTable('user_profiles', user.id, lastSync);

    // Update last sync time
    await setLastSyncTime(Date.now());

    console.log('✓ Supabase changes synced to local');
  } catch (err) {
    console.error('Error syncing Supabase changes:', err);
  }
};

// ============================================
// SYNC INDIVIDUAL TABLE
// ============================================
const syncTable = async (
  tableName: string,
  userId: string,
  lastSync: number
) => {
  try {
    let query = supabase
      .from(tableName)
      .select('*')
      .eq('user_id', userId)
      .gt('updated_at', new Date(lastSync).toISOString());

    if (SOFT_DELETE_TABLES.includes(tableName)) {
      query = query.is('deleted_at', null);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (data && data.length > 0) {
      const localKey = `${tableName}_list`;
      const localData = await AsyncStorage.getItem(localKey);
      const localRecords = localData ? JSON.parse(localData) : [];
      const merged = mergeRecords(localRecords, data);
      await AsyncStorage.setItem(localKey, JSON.stringify(merged));
    }
  } catch (err) {
    console.error(`Error syncing ${tableName}:`, err);
  }
};

// ============================================
// MERGE LOCAL AND REMOTE RECORDS
// ============================================
const mergeRecords = (local: any[], remote: any[]) => {
  const map = new Map();

  // Add all local records first
  local.forEach(record => map.set(record.id, record));

  // Override with remote if newer
  remote.forEach(remoteRecord => {
    const localRecord = map.get(remoteRecord.id);
    
    if (!localRecord) {
      // New record from another device
      map.set(remoteRecord.id, remoteRecord);
    } else if (new Date(remoteRecord.updated_at) > new Date(localRecord.updated_at)) {
      // Remote is newer
      map.set(remoteRecord.id, remoteRecord);
    }
    // Otherwise keep local (local is newer)
  });

  return Array.from(map.values());
};

// ============================================
// SYNC SINGLE CHANGE (Push)
// ============================================
const syncSingleChange = async (change: SyncLog, userId: string) => {
  try {
    const { action, table, data } = change;
    const mapped = table === 'food_log' ? toSnakeCase(data) : data;

    if (action === 'create' || action === 'update') {
      const { error } = await supabase
        .from(table)
        .upsert(
          { ...mapped, user_id: userId, updated_at: new Date().toISOString() },
          { onConflict: 'id' }
        );
      if (error) throw error;
      await markChangeAsSynced(change.id);
    } else if (action === 'delete') {
      const { error } = await supabase
        .from(table)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', data.id)
        .eq('user_id', userId);
      if (error) throw error;
      await markChangeAsSynced(change.id);
    }
  } catch (err) {
    console.error('Error syncing change:', err);
  }
};

// ============================================
// QUEUE LOCAL CHANGES (Offline Support)
// ============================================
export const queueLocalChange = async (
  action: 'create' | 'update' | 'delete',
  table: string,
  data: any
) => {
  try {
    const pending = await getPendingChanges();

    const newChange: SyncLog = {
      id: `${Date.now()}_${Math.random()}`,
      action,
      table,
      data,
      timestamp: Date.now(),
      synced: false,
    };

    pending.push(newChange);
    await AsyncStorage.setItem('pending_changes', JSON.stringify(pending));
  } catch (err) {
    console.error('Error queueing change:', err);
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================
const getPendingChanges = async (): Promise<SyncLog[]> => {
  const data = await AsyncStorage.getItem('pending_changes');
  return data ? JSON.parse(data) : [];
};

const markChangeAsSynced = async (changeId: string) => {
  const pending = await getPendingChanges();
  const updated = pending.filter(c => c.id !== changeId);
  await AsyncStorage.setItem('pending_changes', JSON.stringify(updated));
};

const getLastSyncTime = async (): Promise<number> => {
  const time = await AsyncStorage.getItem(LAST_SYNC_KEY);
  return time ? parseInt(time) : 0;
};

const setLastSyncTime = async (timestamp: number) => {
  await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp.toString());
};

// ============================================
// BACKGROUND SYNC (Periodic)
// ============================================
export const startPeriodicSync = (intervalMs: number = 30000) => {
  const checkOnlineAndSync = async () => {
    const state = await NetInfo.fetch();
    
    if (state.isConnected) {
      await syncLocalChangesToSupabase();
      await syncSupabaseChangesToLocal();
    }
  };

  // Sync every 30 seconds when online
  const interval = setInterval(checkOnlineAndSync, intervalMs);

  return () => clearInterval(interval);
};