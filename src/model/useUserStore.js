import { create } from 'zustand';
import {
  subsAuth,
  loginEmail,
  registerEmail,
  updateAuthProfile,
  loginGoogle,
  logout as logoutAuth,
  subsUser,
  updateUser,
  getUser
} from '../firebaseModel';

export const AVAILABLE_CUISINES = [
  'Italian', 'Mexican', 'Japanese', 'Chinese', 'Indian',
  'Thai', 'French', 'Mediterranean', 'American', 'Korean',
  'Vegetarian', 'Seafood', 'Steakhouse'
];

export const AVAILABLE_PREFERENCES = [
  'Spicy', 'Mild', 'Healthy', 'Comfort Food',
  'Fine Dining', 'Casual', 'Fast Food', 'Outdoor Seating',
  'Romantic', 'Group Friendly', 'Vegan'
];

export const createUserSlice = (set, get) => ({
  // --- State ---
  user: null,           // The Firebase Auth object (uid, email)
  profile: null,        // Custom data from Firestore (username, avatar, dietary restrictions)
  isLoading: true,      // Used for the initial "Checking session..." splash screen
  isEditingProfile: false,
  error: null,
  toast: null,          // { message: string, type: 'error' | 'success' | 'info' }

  // --- Actions ---
  setToast: (message, type = 'info') => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),

  // 1. Initializer: Call this once in your App.js useEffect
  initializeAuth: () => {
    let profileUnsubscribe = null;

    // This listener runs every time the user logs in or out
    const authUnsubscribe = subsAuth(async (firebaseUser) => {
      set({ isLoading: true });

      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      if (firebaseUser) {
        // User is logged in, now listen to their custom profile from Firestore
        let isInitialProfileLoad = true;
        profileUnsubscribe = subsUser(firebaseUser.uid, async (profileDoc) => {
          if (profileDoc.exists()) {
            const data = profileDoc.data();

            //When the user logs in but is registered in an active room then he is kicked out
            //But if the link has a roomID then he is not kicked out 
            if (isInitialProfileLoad) {
              const activeRoomId = data.activeRoom?.roomId;
              if (activeRoomId) {
                const currentPath = window.location.pathname.toUpperCase();
                if (!currentPath.includes(activeRoomId.toUpperCase())) {
                  useAppStore.getState().room.cleanupStaleRoom(firebaseUser.uid).catch((err) => {
                    console.error('Failed to cleanup stale room:', err);
                  });
                }
              }
            }

            // Check for legacy profiles or missing username
            let needsUpdate = false;
            let newUsername = data.username;
            let newDisplayName = data.displayName;

            if (!newUsername || newUsername.includes(' ')) {
              const baseName = firebaseUser.displayName || data.username || 'user';
              newUsername = baseName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 10000);
              needsUpdate = true;
            }
            if (!newDisplayName) {
              newDisplayName = firebaseUser.displayName || data.username || 'Guest';
              needsUpdate = true;
            }

            if (needsUpdate) {
              data.username = newUsername;
              data.displayName = newDisplayName;
              await updateUser(firebaseUser.uid, { username: newUsername, displayName: newDisplayName }, { merge: true });
            }

            isInitialProfileLoad = false;


            setTimeout(() => {
              set({
                user: firebaseUser,
                profile: data,
                isLoading: false
              });
            }, 1000);
          } else {
            // First time login document does not exist yet.
            // The document creation logic is securely handled by registerWithEmail or loginWithGoogle precisely,
            // so we do not generate an accidental conflicting wrapper here.
          }
        });
      } else {
        // User is logged out
        setTimeout(() => {
          set({ user: null, profile: null, isLoading: false });
        }, 750);
      }
    });

    return () => {
      if (profileUnsubscribe) profileUnsubscribe();
      authUnsubscribe();
    };
  },

  // 2. Login Methods
  loginWithEmail: async (email, password) => {
    set({ error: null });
    try {
      await loginEmail(email, password);
      // onAuthStateChanged will handle setting the user state
    } catch (err) {
      set({ error: err });
    }
  },

  registerWithEmail: async (name, email, password, avatarUrl) => {
    set({ error: null });
    try {
      const credential = await registerEmail(email, password);
      await updateAuthProfile(credential.user, { displayName: name });
      // Create the Firestore profile directly with the correct name,
      // because onAuthStateChanged fires before updateAuthProfile finishes
      const baseName = name || 'user';
      const generatedUsername = baseName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 10000);

      const newProfile = {
        username: generatedUsername,
        displayName: name,
        avatar: avatarUrl,
        avatarSeed: Math.random().toString(36).substring(2, 8),
        roomsHosted: 0,
        matchesFound: 0,
        history: [],
        topCuisines: [],
        preferences: [],
        location: null,
        createdAt: new Date()
      };
      await updateUser(credential.user.uid, newProfile);
    } catch (err) {
      set({ error: err });
    }
  },

  loginWithGoogle: async () => {
    set({ error: null });
    try {
      const result = await loginGoogle();
      const firebaseUser = result.user;

      // Since it's Google login, check if they need a profile document
      const profileDoc = await getUser(firebaseUser.uid);
      if (!profileDoc.exists()) {
        const baseName = firebaseUser.displayName || 'user';
        const generatedUsername = baseName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 10000);

        const newProfile = {
          username: generatedUsername,
          displayName: firebaseUser.displayName || 'Guest',
          avatar: firebaseUser.photoURL || '',
          avatarSeed: Math.random().toString(36).substring(2, 8),
          roomsHosted: 0,
          matchesFound: 0,
          history: [],
          topCuisines: [],
          preferences: [],
          location: null,
          createdAt: new Date()
        };
        await updateUser(firebaseUser.uid, newProfile);
      }
    } catch (err) {
      set({ error: err });
    }
  },

  logout: async () => {
    await logoutAuth();
    // onAuthStateChanged will handle the state clearing
  },

  // 3. Update Profile (e.g. changing nickname)
  updateDisplayName: async (newNames) => {
    const { user } = get();
    if (!user) return;

    await updateUser(user.uid, { displayName: newNames }, { merge: true });
    set((state) => ({ profile: { ...state.profile, displayName: newNames } }));
  },

  clearError: () => set({ error: null }),

  setEditingProfile: (isOpen) => set({ isEditingProfile: isOpen }),

  updateProfile: async (newName, newBio, newCuisinesArr, newPrefsArr, newLocation) => {
    const { user, profile } = get();
    if (!user || !profile) return;

    const updatedData = {
      displayName: newName || profile.displayName || '',
      bio: newBio || '',
      preferences: newPrefsArr || [],
      topCuisines: newCuisinesArr || [],
      location: newLocation || profile.location || ''
    };

    // Optimistic update
    set({ profile: { ...profile, ...updatedData }, isEditingProfile: false });

    try {
      await updateUser(user.uid, updatedData, { merge: true });
    } catch (err) {
      console.error("Failed to sync profile updates", err);
      // Rollback optimistic update
      set({ profile, isEditingProfile: true });
    }
  }
});

// Proxy for View components that we aren't allowed to refactor
import { useAppStore } from './useAppStore';
export const useUserStore = (selector) => useAppStore((state) => selector ? selector(state.user) : state.user);
Object.defineProperty(useUserStore, 'getState', {
  get: () => () => useAppStore.getState().user
});
