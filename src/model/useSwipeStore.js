import { create } from 'zustand';
import { getRoom, updateRoomData, addMatchToUser, addVoteToRoom } from '../firebaseModel';

// Check if all members have voted yes on a restaurant
async function checkForMatch(roomId, restaurant, setRoom) {
  const restaurantId = typeof restaurant === 'object' ? restaurant.id : restaurant;
  const updatedSnap = await getRoom(roomId);
  if (!updatedSnap.exists()) return;
  const updatedData = updatedSnap.data();
  const voterArray = updatedData.votes?.[restaurantId] || [];
  const memberCount = updatedData.members?.length ?? 0;

  if (voterArray.length >= memberCount && memberCount > 0) {
    // Persist the full restaurant object so the match page can render it
    // (and link to route/website) without depending on the places store.
    const finalMatchData =
      typeof restaurant === 'object' ? restaurant : { id: restaurantId };

    await updateRoomData(roomId, {
      status: 'MATCHED',
      'config.finalMatch': finalMatchData
    });

    // Also update local room slice immediately so presenters react without
    // waiting for the Firestore real-time listener to fire
    if (setRoom) {
      setRoom({ status: 'MATCHED' });
    }

    const matchHistoryItem = {
      id: restaurantId,
      name: typeof restaurant === 'object' ? restaurant.displayName || restaurant.name || 'Unknown Restaurant' : 'Unknown Restaurant',
      imageUrl: typeof restaurant === 'object' ? restaurant.image : '',
      date: new Date().toLocaleDateString(),
      rating: typeof restaurant === 'object' ? restaurant.rating ?? null : null,
      cuisineLabel: typeof restaurant === 'object' ? restaurant.cuisineLabel || '' : '',
      priceLabel: typeof restaurant === 'object' ? restaurant.priceLabel || '' : '',
      formattedAddress: typeof restaurant === 'object' ? restaurant.formattedAddress || '' : '',
      websiteUri: typeof restaurant === 'object' ? restaurant.websiteUri || '' : ''
    };

    const members = updatedData.members || [];

    // Increment matchesFound and add to history for all members
    for (const member of members) {
      // Build a per-user history item that lists the *other* members they matched with
      const otherNames = members
        .filter(m => m.uid !== member.uid)
        .map(m => m.name || 'Anonymous');

      const personalItem = { ...matchHistoryItem, matchedWith: otherNames };
      await addMatchToUser(member.uid, personalItem);
    }
  }
}

export const createSwipeSlice = (set, get, setRoom) => ({
  // --- State ---
  currentIndex: 0,    // Tracks which card is currently being swiped
  lastDirection: null, // 'left' or 'right' for animation triggers
  votes: {},          // { restaurantId: voteCount } – tallied votes from all members
  memberCount: 0,     // Total number of members in the room
  finalMatch: null,   // Restaurant ID of the matched restaurant (set when status is MATCHED)

  // --- Actions ---

  // Replace the entire votes object (used when syncing from Firestore)
  setVotes: (newVotes) => set({ votes: newVotes }),

  // Update member count (synced from room snapshot)
  setMemberCount: (count) => set({ memberCount: count }),

  // Set the final matched restaurant ID (synced from room config)
  setFinalMatch: (restaurantId) => set({ finalMatch: restaurantId }),

  // Record a "yes" vote in Firestore and check for a full match
  submitVote: async (roomId, userId, restaurant) => {
    const restaurantId = typeof restaurant === 'object' ? restaurant.id : restaurant;
    if (!roomId || !userId || !restaurantId) return;

    // Persist the vote in Firestore
    await addVoteToRoom(roomId, restaurantId, userId);

    await checkForMatch(roomId, restaurant, setRoom);
  },

  // Advance the card index after a swipe
  handleSwipe: ({ direction, restaurant }) => {
    const { currentIndex } = get();
    if (!restaurant) return;

    set({ lastDirection: direction });

    const nextIndex = currentIndex + 1;
    setTimeout(() => {
      set({
        currentIndex: nextIndex,
        lastDirection: null
      });
    }, 200);
  },

  reset: () => set({ currentIndex: 0, lastDirection: null, votes: {}, memberCount: 0, finalMatch: null })
});
