# Room Clear & Item Reward System

## Overview
Automatically detects when all enemies in a room are defeated and spawns random reward items. This system integrates seamlessly with the existing enemy spawn system.

## Features

### Enemy Defeat Detection
- **Automatic Tracking**: System tracks initial enemy count when room loads
- **Real-time Monitoring**: Continuously checks remaining enemies each frame
- **One-time Trigger**: Rewards spawn only once per room clear

### Random Item Spawning
- **1-3 Items**: Random number of items spawn when room is cleared
- **Weighted Rarity**: Common items (health, gold) more likely than rare items (upgrades)
- **Center Spawn**: Items appear near room center with slight randomization
- **Deterministic Mode**: Uses same seed system as enemy spawns for reproducible testing

## Item Rarity Tiers

### Common (Higher Weight)
- `healthPickup` - Restores 1 health
- `gold` - Currency for shops

### Uncommon
- `maxHealthPickup` - Increases max health by 1
- `attackUp` - Increases attack damage by 0.5
- `attackSpeedUp` - Decreases attack cooldown by 0.2s

### Rare
- `thornRoll` - Roll attack damages enemies
- `lifeDrop` - Enemies drop health on death
- `goldDrop` - Enemies drop gold on death
- `backAttack` - Attack hits behind player
- `deathExplosion` - Enemies explode on death
- `damageShield` - Recharging shield blocks one hit

## How It Works

### 1. Room Entry (Game.cpp - SpawnEnemies)
```cpp
// Track initial enemy count for this room
m_nEnemyCount = batCount;
m_bRoomCleared = false;
m_bItemsSpawned = false;
```

### 2. Continuous Checking (Game.cpp - ProcessFrame)
```cpp
CheckRoomCleared(); // Called every frame after object movement
```

### 3. Enemy Count Monitoring (Game.cpp - CheckRoomCleared)
```cpp
const int currentEnemies = m_pObjectManager->countEnemies();

// Room cleared when no enemies remain
if (currentEnemies == 0 && m_nEnemyCount > 0) {
    SpawnRandomItems();
}
```

### 4. Reward Spawning (Game.cpp - SpawnRandomItems)
```cpp
// Spawn 1-3 random items near room center
// Weighted selection from item pool
// Slight position randomization for visual spread
```

## Code Integration Points

### Files Modified

**Game.h**
- Added member variables:
  - `m_nEnemyCount` - Initial enemy count
  - `m_bRoomCleared` - Cleared flag
  - `m_bItemsSpawned` - Prevent duplicate spawns
- Added functions:
  - `CheckRoomCleared()` - Monitor enemy count
  - `SpawnRandomItems()` - Create reward items

**Game.cpp**
- Modified `SpawnEnemies()` to track initial count
- Added `CheckRoomCleared()` implementation
- Added `SpawnRandomItems()` implementation
- Updated `ProcessFrame()` to call check each frame

**ObjectManager.h/cpp**
- Added `countEnemies()` function to count enemies with type 'e'

## Usage

### For Developers
The system works automatically - no manual calls needed. Simply:

1. **Spawn enemies normally** using `SpawnEnemies()`
2. **System tracks** the count automatically
3. **Items spawn** when last enemy dies
4. **Reset happens** when changing rooms

### Testing
```cpp
// In Game.cpp constructor or Initialize():
m_bDeterministicSpawns = true;  // Same room = same items (for testing)
m_bDeterministicSpawns = false; // Random items each time
```

### Customization

**Change Item Count Range** (Game.cpp, SpawnRandomItems):
```cpp
std::uniform_int_distribution<int> countDist(1, 3); // Change 1-3 to desired range
```

**Adjust Rarity Weights** (Game.cpp, SpawnRandomItems):
```cpp
std::vector<eSprite> itemPool = {
    eSprite::healthPickup,      // Add more copies for higher weight
    eSprite::healthPickup,      // Duplicate = 2x as likely
    eSprite::gold,
    // ... rare items appear once = lower weight
};
```

**Change Spawn Spread** (Game.cpp, SpawnRandomItems):
```cpp
std::uniform_real_distribution<float> offsetDist(-80.0f, 80.0f); // Adjust range
```

## Boss Room Behavior

Boss room (type 999) spawns **zero enemies**, so:
- `m_nEnemyCount = 0` 
- Items **won't spawn** (no enemies to defeat)
- Room is considered "already cleared"
- Boss room items should be handled separately

## Future Enhancements

### Potential Additions
- **Door unlock**: Prevent room exit until cleared
- **Visual feedback**: Particle effect when room cleared
- **Audio cue**: Sound effect when items spawn
- **Item quality scaling**: Better items in later rooms
- **Guaranteed drops**: Specific items for certain rooms
- **Chest spawn**: Spawn a chest instead of loose items

### Integration Ideas
```cpp
// In CheckRoomCleared(), after items spawn:
PlayClearSound();                    // Audio feedback
SpawnClearParticles(roomCenter);     // Visual effect
UnlockDoors();                       // Enable room exits
IncrementClearedCount();             // Track progress
```

## Debugging

### Check Enemy Count
```cpp
// In ProcessFrame or RenderFrame:
std::string debug = "Enemies: " + std::to_string(m_pObjectManager->countEnemies());
m_pRenderer->DrawScreenText(debug.c_str(), Vector2(10, 100));
```

### Force Item Spawn (Testing)
```cpp
// In KeyboardHandler:
if (m_pKeyboard->TriggerDown('I')) {
    SpawnRandomItems(); // Manual trigger for testing
}
```

## Related Systems
- **Enemy Spawn System**: SPAWN_SYSTEM_GUIDE.md
- **Item Types**: Item.h/cpp
- **Object Manager**: ObjectManager.h/cpp
- **Room System**: Room.h/cpp

## Notes
- Items spawn **after** all enemies defeated, not during combat
- Boss room (999) intentionally excluded from item spawning
- Deterministic mode uses `roomType + 1000` as seed (different from enemy seed)
- Items spawn in world space, not screen space
- System resets automatically when changing rooms
