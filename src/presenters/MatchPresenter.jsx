import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { MatchView } from '../views/MatchView';
import { LoadingOverlayView } from '../views/components/LoadingOverlayView';

/**
 * Presenter: wires store state to MatchView and handles event callbacks.
 */
function MatchPresenter({ model }) {
  const navigate = useNavigate();

  // --- User ---
  const user = model.user.user;

  // --- Room ---
  const roomId = model.room.roomId;
  const roomStatus = model.room.status;
  const roomData = model.room.roomData;
  const subscribeToRoom = model.room.subscribeToRoom;
  const leaveRoomRemote = model.room.leaveRoomRemote;
  const resetRoom = model.room.resetRoom;

  // The full matched restaurant object is persisted in the room document by
  // useSwipeStore.checkForMatch, so this presenter does not depend on the
  // places store (which is reset when SwipePresenter unmounts).
  const matchedRestaurant = roomData?.config?.finalMatch ?? null;

  // Re-subscribe to room if we navigated here and lost the subscription
  useEffect(() => {
    if (roomId && user?.uid && !roomData) {
      const unsubscribe = subscribeToRoom(roomId, user.uid);
      return () => { if (unsubscribe) unsubscribe(); };
    }
  }, [roomId, user?.uid, roomData]);

  // Redirect away if room status is no longer MATCHED, or if we lost the room context (e.g. hard refresh)
  useEffect(() => {
    if (!roomId) {
      // Hard refresh on /match without a room in the store
      navigate('/');
    } else if (roomStatus && roomStatus !== 'MATCHED') {
      navigate('/');
    }
  }, [roomId, roomStatus, navigate]);



  // --- Event handlers ---
  function handleViewRoute() {
    const query = matchedRestaurant?.formattedAddress || matchedRestaurant?.displayName;
    return query;

  }



  async function handleLeave() {
    if (user?.uid) {
      await leaveRoomRemote(user.uid);
    }
    resetRoom();
    navigate('/');
  }

  // Handle loading state and prevent "No match found" flash
  if (roomId && !roomData) {
    return <LoadingOverlayView />;
  }

  return (
    <MatchView
      matchedRestaurant={matchedRestaurant}
      onViewRoute={handleViewRoute}
      onLeave={handleLeave}
    />
  );
}

export default MatchPresenter;
