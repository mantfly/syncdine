import { create } from 'zustand';
import { getCurrentLocation } from '../api/PlacesApi';
import { fetchAndShapeRestaurants } from '../utils/PlaceStore';
import {
  createRoom,
  incrementRoomsHosted,
  getRoom,
  getUser,
  addRoomMember,
  subsRoom,
  updateRoomData,
  deleteRoom,
  removeRoomMember,
  addVoteToRoom,
  addMatchToUser,
  removeVotesForUser,
  setActiveRoom,
  clearActiveRoom
} from '../firebaseModel';

export const createRoomSlice = (set, get) => ({
  // --- Properties (State) ---
  roomId: null,
  roomData: null,
  isLoading: false,
  error: null,
  unsubscribe: null, // Holds the function to stop listening to Firebase

  // --- Room UI state (used by room presenters) ---
  roomCode: null,
  members: [],
  status: null,
  isAdmin: false,
  filters: { roomName: "", distance: 5, cuisines: [], priceLevels: [], minRating: 0 },
  previewCode: "",
  joinCode: "",
  roomLocation: null,
  addressSuggestions: [],
  addressSearchMode: false,
  manualAddressInput: '',

  // --- Restaurant state (fetched via room location) ---
  restaurants: [],
  restaurantsLoading: false,
  restaurantsError: null,
  restaurantsFetched: false,

  // --- Actions ---

  fetchRoomLocation: async () => {
    try {
      const { getCurrentLocation } = await import('../api/PlacesApi');
      const location = await getCurrentLocation();
      set({ roomLocation: location, manualAddressInput: '' });
    } catch (err) {
      set({ error: err.message });
    }
  },

  setManualAddressInput: (text) => set({ manualAddressInput: text }),

  setManualLocation: (lat, lng, address) => {
    set({ roomLocation: { latitude: lat, longitude: lng, address } });
  },

  //get autocomplete suggestions from the autocomplete api endpoint
  autocompleteAddress: async (input) => {
    if (!input || input.trim() === '') {
      set({ addressSuggestions: [] });
      return;
    }
    try {
      const { fetchAddressSuggestions } = await import('../api/PlacesApi');
      const data = await fetchAddressSuggestions(input);
      set({ addressSuggestions: data.suggestions || [] });
    } catch (err) {
      console.error(err);
      set({ addressSuggestions: [] });
    }
  },
  //when the address is chosen, get the long and lat coords from the geocoding endpoint
  selectAddressSuggestion: async (placeId) => {
    set({ addressSuggestions: [], addressSearchMode: false });
    try {
      const { fetchPlaceDetails } = await import('../api/PlacesApi');
      const data = await fetchPlaceDetails(placeId);
      if (data && data.location) {
        const addressText = data.formattedAddress || data.name;
        set({
          roomLocation: {
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            address: addressText
          },
          manualAddressInput: addressText
        });
      }
    } catch (err) {
      console.error(err);
      set({ error: "Failed to get location details." });
    }
  },

  setRoomError: (msg) => set({ error: msg }),
  clearRoomError: () => set({ error: null }),

  successMsg: null,
  setSuccessMsg: (msg) => set({ successMsg: msg }),
  clearSuccessMsg: () => set({ successMsg: null }),

  // --- Restaurant actions ---
  fetchRestaurants: async (filters = {}, location = null) => {
    set({ restaurantsLoading: true, restaurantsError: null });
    try {
      const resolvedLocation = location ?? get().roomLocation;
      if (!resolvedLocation) {
        throw new Error('No room location available to fetch restaurants.');
      }
      const places = await fetchAndShapeRestaurants(filters, resolvedLocation);
      set({ restaurants: places, restaurantsLoading: false, restaurantsFetched: true });
    } catch (err) {
      set({ restaurantsError: err.message, restaurantsLoading: false, restaurantsFetched: true });
    }
  },

  resetRestaurants: () => set({ restaurants: [], restaurantsLoading: false, restaurantsError: null, restaurantsFetched: false }),




  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  setJoinCode: (value) => set({ joinCode: value }),

  generateRoomCode: () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  initializeCreateRoomDraft: () => {
    const code = get().generateRoomCode();
    set({
      previewCode: code,
      filters: { roomName: "", distance: 5, cuisines: [], priceLevels: [], minRating: 0 },
    });
    return code;
  },

  setRoomData: (data) =>
    set((state) => ({
      roomCode: data.roomCode !== undefined ? data.roomCode : state.roomCode,
      members: data.members !== undefined ? data.members : state.members,
      status: data.status !== undefined ? data.status : state.status,
      isAdmin: data.isAdmin !== undefined ? data.isAdmin : state.isAdmin,
      filters: data.filters !== undefined ? data.filters : state.filters,
    })),

  resetRoom: () =>
    set({
      roomCode: null,
      members: [],
      status: null,
      isAdmin: false,
      filters: { roomName: "", distance: 5, cuisines: [], priceLevels: [], minRating: 0 },
      previewCode: "",
      joinCode: "",
      roomLocation: null,
      manualAddressInput: '',
      restaurants: [],
      restaurantsLoading: false,
      restaurantsError: null,
      restaurantsFetched: false,
    }),

  // Create room document using current application state.
  createRoom: async (user, forcedCode) => {
    if (!user) return null;

    // --- Single-room enforcement: block if already in a room ---
    try {
      const userDoc = await getUser(user.uid);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.activeRoom) {
          const existingRoom = await getRoom(userData.activeRoom.roomId);
          if (existingRoom.exists()) {
            const data = existingRoom.data();
            if (data.status === 'MATCHED') {
              const isHost = data.config && data.config.hostId === user.uid;
              if (isHost) {
                await deleteRoom(userData.activeRoom.roomId);
              } else {
                const member = (data.members || []).find(m => m.uid === user.uid);
                if (member) await removeRoomMember(userData.activeRoom.roomId, member);
              }
              await clearActiveRoom(user.uid);
            } else {
              set({ error: `You're already in room ${userData.activeRoom.roomId}. Leave that room first.` });
              return null;
            }
          } else {
            // Room no longer exists — stale, clear it
            await clearActiveRoom(user.uid);
          }
        }
      }
    } catch (err) {
      console.error('activeRoom check failed, proceeding anyway:', err);
    }

    const { filters, previewCode, roomLocation } = get(); // add roomLocation
    const roomCode = (forcedCode || previewCode || get().generateRoomCode()).toUpperCase();

    const initialMember = {
      name: user.displayName || user.username || 'Anonymous',
      uid: user.uid,
      photo: user.photoURL || user.avatar || null,
      isReady: false,
      lat: null,
      lng: null
    };
    const newRoomData = {
      config: {
        hostId: user.uid,
        finalMatch: null,
        location: roomLocation ?? null, // ← add this
        ...filters
      },
      members: [initialMember],
      status: "LOBBY",
      votes: {}
    };

    await createRoom(roomCode, newRoomData);

    // Increment roomsHosted cleanly once on room creation
    await incrementRoomsHosted(user.uid);

    // Mark this room as the user's active room
    await setActiveRoom(user.uid, roomCode);

    return roomCode;
  },

  joinRoom: async (user, inputCode) => {
    if (!user || !inputCode) return { ok: false, reason: 'INVALID_INPUT' };

    // --- Single-room enforcement: block if already in a different room ---
    try {
      const userDoc = await getUser(user.uid);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.activeRoom) {
          const existingRoomId = userData.activeRoom.roomId;
          // Allow re-joining the same room (e.g. refreshing the page)
          if (existingRoomId !== inputCode.toUpperCase()) {
            const existingRoom = await getRoom(existingRoomId);
            if (existingRoom.exists()) {
              const data = existingRoom.data();
              if (data.status === 'MATCHED') {
                const isHost = data.config && data.config.hostId === user.uid;
                if (isHost) {
                  await deleteRoom(existingRoomId);
                } else {
                  const member = (data.members || []).find(m => m.uid === user.uid);
                  if (member) await removeRoomMember(existingRoomId, member);
                }
                await clearActiveRoom(user.uid);
              } else {
                set({ error: `You're already in room ${existingRoomId}. Leave that room first.` });
                return { ok: false, reason: 'ALREADY_IN_ROOM' };
              }
            } else {
              // Room no longer exists — stale, clear it
              await clearActiveRoom(user.uid);
            }
          }
        }
      }
    } catch (err) {
      console.error('activeRoom check failed, proceeding anyway:', err);
    }

    const code = inputCode.toUpperCase();
    const roomSnap = await getRoom(code);

    if (!roomSnap.exists()) {
      return { ok: false, reason: 'ROOM_NOT_FOUND' };
    }

    const data = roomSnap.data();
    const alreadyMember = (data.members || []).some((member) => member.uid === user.uid);
    if (!alreadyMember) {
      const newMember = {
        name: user.displayName || user.username || 'Anonymous',
        uid: user.uid,
        photo: user.avatar || user.photoURL || null,
        isReady: false,
        lat: null,
        lng: null
      };
      await addRoomMember(code, newMember);
    }

    // Mark this room as the user's active room
    await setActiveRoom(user.uid, code);

    return { ok: true, code };
  },

  subscribeToRoom: (code, userId, onRoomMissing) => {
    if (!code || !userId) return null;
    if (get().unsubscribe) get().unsubscribe();

    const unsubscribe = subsRoom(code, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const isHost = data.config && data.config.hostId === userId;
        const members = data.members || [];
        
        const previousData = get().roomData;
        const wasMemberPreviously = previousData ? previousData.members.some(m => m.uid === userId) : false;
        
        // Check if the current user was removed from members
        const isMember = members.some(m => m.uid === userId);
        
        if (wasMemberPreviously && !isMember && !isHost) {
          // User was kicked!
          clearActiveRoom(userId).catch(() => {});
          const wasAdmin = get().isAdmin;
          get().resetRoom();
          if (onRoomMissing) onRoomMissing(wasAdmin, true); // true = wasKicked
          return;
        }

        set((state) => ({
          roomData: data,
          roomId: code,
          roomCode: code,
          members: members,
          status: data.status || 'LOBBY',
          isAdmin: isHost,
          roomLocation: data.config?.location ?? state.roomLocation,
          filters: data.config ? {
            roomName: data.config.roomName || "",
            distance: data.config.distance || 5,
            cuisines: data.config.cuisines || [],
            priceLevels: Array.isArray(data.config.priceLevels) ? data.config.priceLevels : [],
            minRating: data.config.minRating || 0,
          } : state.filters,
          isLoading: false,
          error: null,
        }));
        return;
      }

      // Room was deleted — clear the user's active room marker
      clearActiveRoom(userId).catch(() => {});

      const wasAdmin = get().isAdmin;
      get().resetRoom();
      if (onRoomMissing) onRoomMissing(wasAdmin, false);
    });

    set({ unsubscribe });
    return unsubscribe;
  },

  startSwipingIfReady: async (roomId) => {
    const { members } = get();
    if (!roomId || !members || members.length === 0) return;
    const allReady = members.every((member) => Boolean(member.isReady));
    if (!allReady) return;
    try {
      await updateRoomData(roomId, { status: 'SWIPING' });
    } catch (err) {
      console.error('Error starting swiping phase:', err);
      set({ error: err.message });
    }
  },

  toggleReady: async (roomId, userId) => {
    if (!roomId || !userId) return;
    const { members } = get();
    if (!members || members.length === 0) return;

    const currentUserMember = members.find((member) => member.uid === userId);
    if (!currentUserMember) return;

    const newMembersArray = members.map((member) =>
      member.uid === userId
        ? { ...member, isReady: !member.isReady }
        : member
    );
    try {
      await updateRoomData(roomId, { members: newMembersArray });
    } catch (err) {
      console.error('Error toggling ready state:', err);
      set({ error: err.message });
    }
  },

  updateRoomFilters: async (roomId, newFilters) => {
    if (!roomId || !newFilters) return;
    const updates = {
      "config.roomName": newFilters.roomName,
      "config.distance": newFilters.distance,
      "config.cuisines": newFilters.cuisines,
      "config.priceLevels": newFilters.priceLevels,
      "config.minRating": newFilters.minRating,
    };
    try {
      await updateRoomData(roomId, updates);
      set({ successMsg: 'Room preferences updated successfully' });
    } catch (err) {
      console.error('Error updating room filters:', err);
      set({ error: err.message || 'Failed to update room preferences' });
    }
  },

  markDoneSwiping: async (roomId, userId) => {
    if (!roomId || !userId) return;
    const { members } = get();
    if (!members || members.length === 0) return;

    const alreadyDone = members.find((m) => m.uid === userId)?.doneSwiping;
    if (alreadyDone) return;

    const newMembersArray = members.map((member) =>
      member.uid === userId
        ? { ...member, doneSwiping: true }
        : member
    );

    await updateRoomData(roomId, { members: newMembersArray });
  },

  setUserAway: async (roomId, userId, isAway) => {
    if (!roomId || !userId) return;
    const { members } = get();
    if (!members || members.length === 0) return;

    const currentUserMember = members.find((member) => member.uid === userId);
    if (!currentUserMember) return;

    // Only update if it actually changed
    if (currentUserMember.isAway === isAway) return;

    const newMembersArray = members.map((member) => {
      if (member.uid === userId) {
        return { 
          ...member, 
          isAway, 
          // If they go away, automatically unready them
          isReady: isAway ? false : member.isReady 
        };
      }
      return member;
    });

    await updateRoomData(roomId, { members: newMembersArray });
  },

  updateMemberLocation: async (roomId, userId, latitude, longitude) => {
    if (!roomId || !userId) return;
    const { members } = get();
    if (!members || members.length === 0) return;

    const currentUserMember = members.find((member) => member.uid === userId);
    if (!currentUserMember) return;

    const newMembersArray = members.map((member) =>
      member.uid === userId
        ? { ...member, lat: latitude, lng: longitude }
        : member
    );
    try {
      await updateRoomData(roomId, { members: newMembersArray });
    } catch (err) {
      console.error('Error updating member location:', err);
      set({ error: err.message });
    }
  },

  recheckVotesForMatch: async (roomId) => {
    if (!roomId) return;
    const snap = await getRoom(roomId);
    if (!snap.exists()) return;
    const data = snap.data();
    if (data.status !== 'SWIPING') return;
    const memberCount = data.members?.length ?? 0;
    if (memberCount === 0) return;
    const votes = data.votes || {};
    const { restaurants } = get();
    for (const [restaurantId, voterArray] of Object.entries(votes)) {
      if (Array.isArray(voterArray) && voterArray.length >= memberCount) {
        const restaurant = restaurants.find(r => r.id === restaurantId);
        const finalMatchData = restaurant || { id: restaurantId };
        await updateRoomData(roomId, {
          status: 'MATCHED',
          'config.finalMatch': finalMatchData
        });
        const matchHistoryItem = {
          id: restaurantId,
          name: restaurant?.displayName || restaurant?.name || 'Unknown Restaurant',
          imageUrl: restaurant?.imageUrl || '',
          date: new Date().toLocaleDateString()
        };
        const memberUids = data.members.map(m => m.uid);
        for (const uid of memberUids) {
          await addMatchToUser(uid, matchHistoryItem);
        }
        break;
      }
    }
  },

  leaveRoomRemote: async (userIdOrRoomId, maybeUserId) => {
    const userId = maybeUserId || userIdOrRoomId;
    const explicitRoomId = maybeUserId ? userIdOrRoomId : null;
    if (!userId) return;
    const { roomId: currentRoomId, isAdmin, members, status } = get();
    const roomId = explicitRoomId || currentRoomId;
    if (!roomId) return;
    try {
      const roomSnap = await getRoom(roomId);
      if (!roomSnap.exists()) {
        await clearActiveRoom(userId);
        return;
      }

      const roomData = roomSnap.data();
      const remoteMembers = roomData.members || members || [];
      const remoteStatus = roomData.status || status;
      const isHost = roomData.config?.hostId === userId || (!explicitRoomId && isAdmin);

      if (isHost) {
        await deleteRoom(roomId);
        await clearActiveRoom(userId);
        return;
      }

      // Remove the user's votes and member entry
      if (remoteStatus === 'SWIPING') {
        await removeVotesForUser(roomId, userId);
      }

      const memberToRemove = remoteMembers.find((member) => member.uid === userId);
      if (memberToRemove) {
        await removeRoomMember(roomId, memberToRemove);
      }

      // Clear the user's active room marker
      await clearActiveRoom(userId);

      // After removing a member during swiping, re-check all votes for a match
      // (fewer members means existing votes may now be sufficient)
      if (remoteStatus === 'SWIPING') {
        await get().recheckVotesForMatch(roomId);
      }
    } catch (err) {
      console.error('Error leaving room:', err);
      set({ error: err.message });
    }
  },

  deleteRoomById: async (roomId, userId) => {
    if (!roomId) return;
    try {
      await deleteRoom(roomId);
      if (userId) await clearActiveRoom(userId);
    } catch (err) {
      console.error('Error deleting room:', err);
      set({ error: err.message });
    }
  },

  kickMember: async (roomId, targetUserId) => {
    if (!roomId || !targetUserId) return;
    const { isAdmin, members, status } = get();

    if (!isAdmin) return;

    const memberToRemove = members.find((member) => member.uid === targetUserId);
    if (!memberToRemove) return;

    try {
      if (status === 'SWIPING') {
        await removeVotesForUser(roomId, targetUserId);
      }
      await removeRoomMember(roomId, memberToRemove);
      // Clear the active room for the kicked user so they don't get stuck
      await clearActiveRoom(targetUserId);
      if (status === 'SWIPING') {
        await get().recheckVotesForMatch(roomId);
      }
      set({ successMsg: 'User kicked successfully' });
    } catch (err) {
      console.error('Error kicking member:', err);
      set({ error: err.message || 'Failed to kick user' });
    }
  },

  // Clean up a stale activeRoom (e.g. after a crash / forced logout)
  cleanupStaleRoom: async (uid) => {
    const userDoc = await getUser(uid);
    if (!userDoc.exists()) return null;
    const userData = userDoc.data();
    if (!userData.activeRoom) return null;

    const { roomId } = userData.activeRoom;
    const roomSnap = await getRoom(roomId);

    if (roomSnap.exists()) {
      const roomData = roomSnap.data();
      const member = (roomData.members || []).find((m) => m.uid === uid);
      if (member) {
        if (roomData.status === 'SWIPING') {
          await removeVotesForUser(roomId, uid);
        }
        await removeRoomMember(roomId, member);
      }
      // Re-check votes after removal (fewer members may cause a match)
      if (roomData.status === 'SWIPING') {
        await get().recheckVotesForMatch(roomId);
      }
    }

    await clearActiveRoom(uid);
    return roomId;
  },

  // 4. Record a "Yes" Swipe
  submitVote: async (userId, restaurantId) => {
    const { roomId, roomData } = get();
    if (!roomId || !roomData) {
      // Swiping can be used outside a room; in that case we simply don't persist votes.
      return;
    }
    // We use a dynamic key in the 'votes' object to track who liked what
    await addVoteToRoom(roomId, restaurantId, userId);

    // CHECK FOR MATCH: 
    // If the length of the UIDs in this restaurant's vote array 
    // equals the number of members in the room, it's a match!
    const updatedVotes = roomData.votes?.[restaurantId] || [];
    if (updatedVotes.length + 1 === (roomData.members?.length ?? 0)) {
      await updateRoomData(roomId, {
        status: 'MATCHED',
        finalMatch: restaurantId
      });

      // [Gourmet Identity Hub Trigger] Every member in the room gets +1 matchesFound
      const memberUids = (roomData.members || []).map(m => m.uid);
      for (const uid of memberUids) {
        await addMatchToUser(uid);
      }
    }
  },

  // 5. Cleanup
  leaveRoom: () => {
    const { unsubscribe } = get();
    if (unsubscribe) unsubscribe();
    set({ roomId: null, roomData: null, unsubscribe: null });
  }
});
