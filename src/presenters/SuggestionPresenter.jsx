import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SuggestionView } from '../views/SuggestionView';

/**
 * Presenter: wires store state to SuggestionView.
 * Subscribes to the room, fetches restaurants, and cross-references
 * votes with restaurant data to build a sorted list of partial matches.
 */
function SuggestionPresenter({ model }) {
  const navigate = useNavigate();
  const { roomId: routeRoomId } = useParams();

  const user = model.user.user;

  const roomId = model.room.roomId;
  const roomData = model.room.roomData;
  const subscribeToRoom = model.room.subscribeToRoom;
  const leaveRoomRemote = model.room.leaveRoomRemote;
  const resetRoom = model.room.resetRoom;

  const restaurants = model.room.restaurants;
  const resetRestaurants = model.room.resetRestaurants;

  // Subscribe to room
  useEffect(() => {
    if (!routeRoomId || !user?.uid) return;
    const unsubscribe = subscribeToRoom(routeRoomId, user.uid);
    return () => { if (unsubscribe) unsubscribe(); };
  }, [routeRoomId, user?.uid]);

  // Build sorted list of voted restaurants
  const votedRestaurants = useMemo(() => {
    if (!roomData?.votes || !restaurants?.length) return [];

    const memberCount = roomData.members?.length ?? 0;
    const entries = [];

    for (const [restaurantId, voterArray] of Object.entries(roomData.votes)) {
      const voteCount = Array.isArray(voterArray) ? voterArray.length : 0;
      if (voteCount === 0) continue;

      const restaurant = restaurants.find((r) => r.id === restaurantId);
      if (!restaurant) continue;

      entries.push({ restaurant, voteCount, memberCount });
    }

    // Sort descending by vote count
    entries.sort((a, b) => b.voteCount - a.voteCount);
    return entries;
  }, [roomData?.votes, roomData?.members?.length, restaurants]);

  function handleViewRoute(restaurant) {
    return restaurant.formattedAddress || restaurant.displayName;
  }

  function handleVisitWebsite(restaurant) {
    return restaurant.websiteUri;
  }

  async function handleLeave() {
    if (user?.uid) {
      await leaveRoomRemote(user.uid);
    }
    resetRoom();
    resetRestaurants();
    navigate('/');
  }

  return (
    <SuggestionView
      restaurants={votedRestaurants}
      onViewRoute={handleViewRoute}
      onVisitWebsite={handleVisitWebsite}
      onLeave={handleLeave}
    />
  );
}

export { SuggestionPresenter };
