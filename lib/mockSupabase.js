// Mock Supabase for testing/development on web
const mockUsers = {
  'silent411@gmail.com': {
    id: 'test-user-123',
    email: 'silent411@gmail.com',
    password: 'password123', // For testing only
    user_metadata: {
      name: 'Test User'
    }
  }
};

let currentSession = null;
const authSubscribers = [];

// Helper function to load session from localStorage
const loadSessionFromStorage = () => {
  try {
    const savedSession = localStorage.getItem('supabase_session');
    if (savedSession) {
      currentSession = JSON.parse(savedSession);
    }
  } catch (error) {
    console.error('Error loading session from storage:', error);
    currentSession = null;
  }
};

// Helper function to save session to localStorage
const saveSessionToStorage = (session) => {
  try {
    if (session) {
      localStorage.setItem('supabase_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('supabase_session');
    }
  } catch (error) {
    console.error('Error saving session to storage:', error);
  }
};

// Initialize current session from storage on load
loadSessionFromStorage();

export const mockSupabase = {
  auth: {
    signInWithPassword: async ({ email, password }) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = mockUsers[email];
      if (!user) {
        return {
          data: null,
          error: { message: `User ${email} not found. Please register first.` }
        };
      }
      
      if (user.password !== password) {
        return {
          data: null,
          error: { message: 'Invalid email or password. Please try again.' }
        };
      }
      
      const userData = {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata
      };
      
      const sessionData = { user: userData };
      currentSession = sessionData;
      saveSessionToStorage(sessionData);
      
      // Notify all subscribers
      authSubscribers.forEach(callback => {
        callback('SIGNED_IN', sessionData);
      });
      
      return {
        data: { user: userData },
        error: null
      };
    },
    
    signUp: async ({ email, password }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (mockUsers[email]) {
        return {
          data: null,
          error: { message: 'User already exists. Please log in instead.' }
        };
      }
      
      const newUser = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email,
        password,
        user_metadata: { name: email.split('@')[0] }
      };
      
      mockUsers[email] = newUser;
      const sessionData = { user: newUser };
      currentSession = sessionData;
      saveSessionToStorage(sessionData);
      
      // Notify all subscribers
      authSubscribers.forEach(callback => {
        callback('SIGNED_UP', sessionData);
      });
      
      return {
        data: { user: newUser },
        error: null
      };
    },
    
    signOut: async () => {
      currentSession = null;
      saveSessionToStorage(null);
      
      // Notify all subscribers
      authSubscribers.forEach(callback => {
        callback('SIGNED_OUT', null);
      });
      
      return { error: null };
    },
    
    getSession: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      // Reload from storage in case another tab signed in/out
      loadSessionFromStorage();
      return {
        data: {
          session: currentSession
        },
        error: null
      };
    },
    
    onAuthStateChange: (callback) => {
      // Add the subscriber
      authSubscribers.push(callback);
      
      // Immediately notify with current session state
      if (currentSession) {
        callback('SIGNED_IN', currentSession);
      }
      
      // Return subscription object
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const index = authSubscribers.indexOf(callback);
              if (index > -1) {
                authSubscribers.splice(index, 1);
              }
            }
          }
        }
      };
    }
  }
};
