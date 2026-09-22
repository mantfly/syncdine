
import { SwipeView } from '../views/SwipeView';
import { SwipeWaitingView } from '../views/SwipeWaitingView';
import { SwipeMembersPanel } from '../views/components/SwipeMembersPanel';
import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoomPresenter } from './useRoomPresenter';

/**
 * Presenter: subscribes to model stores and passes props to SwipeView.
 * No business logic here — only wiring (reading state, calling model actions,
 * forwarding events).
 */
function SwipePresenter({ model }) {
  const navigate = useNavigate();
  const { roomId: routeRoomId } = useParams();

  // --- User ---
  const user = model.user.user;

  // --- Swipe state ---
  const currentIndex = model.swipe.currentIndex;
  const handleSwipe = model.swipe.handleSwipe;
  const resetSwipeState = model.swipe.reset;
  const votes = model.swipe.votes;
  const setVotes = model.swipe.setVotes;
  const setMemberCount = model.swipe.setMemberCount;
  const setFinalMatch = model.swipe.setFinalMatch;
  const submitVote = model.swipe.submitVote;

  // --- Places (now from room store) ---
  const restaurants = model.room.restaurants;
  const isLoading = model.room.restaurantsLoading;
  const error = model.room.restaurantsError;
  const fetchRestaurants = model.room.fetchRestaurants;
  const resetRestaurants = model.room.resetRestaurants;
  const restaurantsFetched = model.room.restaurantsFetched;

  // --- Room ---
  const roomId = model.room.roomId;
  const roomLocation = model.room.roomLocation;
  const filters = model.room.filters;
  const roomStatus = model.room.status;
  const roomData = model.room.roomData;
  const members = model.room.members;
  const subscribeToRoom = model.room.subscribeToRoom;
  const markDoneSwiping = model.room.markDoneSwiping;
  const leaveRoomRemote = model.room.leaveRoomRemote;
  const resetRoom = model.room.resetRoom;
  const isAdmin = model.room.isAdmin;

  const { handleKickMember } = useRoomPresenter(model);

  const hasMarkedDone = useRef(false);
  const prevMembersRef = useRef(null);


  // Track latest state in a ref specifically for the unmount cleanup below
  const latestState = useRef({ roomStatus, roomId, userId: user?.uid });
  useEffect(() => {
    latestState.current = { roomStatus, roomId, userId: user?.uid };
  }, [roomStatus, roomId, user?.uid]);


  // Subscribe to room using the route param (only needed to initiate the subscription)
  useEffect(() => {
    if (!routeRoomId || !user?.uid) return;
    const unsubscribe = subscribeToRoom(routeRoomId, user.uid, (wasAdmin, wasKicked) => {
      if (wasKicked) {
        model.user.setToast("You have been kicked from the room.", "error");
      } else if (!wasAdmin) {
        model.room.setRoomError("The session has ended because the host left the room.");
      }
      navigate('/');
    });


    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [routeRoomId, user?.uid]);

  // Fetch restaurants once roomLocation is available and list is empty
  useEffect(() => {
    if (!roomLocation) return; // wait until room location is synced from Firestore
    if (!restaurantsFetched && !isLoading && !error) fetchRestaurants(filters, roomLocation);
  }, [fetchRestaurants, isLoading, restaurantsFetched, filters, error, roomLocation]);

  // Reset card index when entering a new room
  useEffect(() => {
    resetSwipeState();
  }, [resetSwipeState, roomId]);

  // Sync votes, memberCount, and finalMatch from Firestore into useSwipeStore
  useEffect(() => {
    if (!roomData) return;
    if (roomData.votes) {
      const tallied = {};
      for (const [restaurantId, voterArray] of Object.entries(roomData.votes)) {
        tallied[restaurantId] = Array.isArray(voterArray) ? voterArray.length : 0;
      }
      setVotes(tallied);
    }
    setMemberCount(roomData.members?.length ?? 0);
    setFinalMatch(roomData.config?.finalMatch ?? null);
  }, [roomData, setVotes, setMemberCount, setFinalMatch]);

  // Redirect when the room reaches MATCHED status
  useEffect(() => {
    if (roomId && roomStatus === 'MATCHED') {
      navigate('/match');
    }
  }, [roomId, roomStatus, navigate]);

  // Redirect back to room if status is no longer SWIPING (and not MATCHED)
  useEffect(() => {
    if (roomId && roomStatus && roomStatus !== 'SWIPING' && roomStatus !== 'MATCHED') {
      navigate(`/room/${roomId}`);
    }
  }, [roomId, roomStatus, navigate]);


  // Mark user as done swiping when all cards are swiped
  useEffect(() => {
    if (
      restaurants?.length > 0 &&
      !isLoading &&
      currentIndex >= restaurants.length &&
      roomStatus === 'SWIPING' &&
      routeRoomId &&
      user?.uid &&
      !hasMarkedDone.current
    ) {
      hasMarkedDone.current = true;
      markDoneSwiping(routeRoomId, user.uid);
    }
  }, [currentIndex, restaurants?.length, isLoading, roomStatus, routeRoomId, user?.uid, markDoneSwiping]);

  // Navigate to no-match page only when ALL members are done swiping
  useEffect(() => {
    if (
      roomStatus === 'SWIPING' &&
      members?.length > 0 &&
      members.every((m) => m.doneSwiping)
    ) {
      navigate(`/room/${routeRoomId}/no-match`, { replace: true });
    }
  }, [members, roomStatus, routeRoomId, navigate]);

  // Detect when a member leaves during swiping
  useEffect(() => {
    if (roomStatus !== 'SWIPING' || !members) {
      prevMembersRef.current = members;
      return;
    }
    const prev = prevMembersRef.current;
    if (prev && prev.length > members.length) {
      const currentUids = new Set(members.map((m) => m.uid));
      const left = prev.filter((m) => !currentUids.has(m.uid));
      left.forEach((m) => {
        model.user.setToast(`${m.name || 'A member'} left the room`, 'info');
      });
    }
    prevMembersRef.current = members;
  }, [members, roomStatus]);

  // Reset swipe-specific state when leaving the swiping page.
  // Do NOT reset restaurants or room here — SuggestionPresenter needs them
  // when navigating to the no-match page.
  useEffect(() => {
    return () => {
      resetSwipeState();
    };
  }, []);

  // Forward a swipe event: on right-swipe, submit vote to swipe model
  function swipeHandlerACB(direction) {
    const restaurant = restaurants?.[currentIndex] ?? null;
    if (!restaurant) return;

    // Right swipe = "yes" vote → swipe store persists & checks for match
    if (direction === 'right' && roomId && user?.uid && restaurant.id) {
      submitVote(roomId, user.uid, restaurant);
    }

    handleSwipe({ direction, restaurant });
  }

  async function swipeResetACB() {
    if (user?.uid) {
      await leaveRoomRemote(user.uid);
    }
    resetRoom();
    resetRestaurants();
    resetSwipeState();
    navigate('/');
  }

  const currentRestaurant = restaurants?.[currentIndex] ?? null;
  const nextRestaurant = restaurants?.[currentIndex + 1] ?? null;
  const totalRemaining = restaurants ? restaurants.length - currentIndex : 0;
  const canSwipe = Boolean(currentRestaurant) && !isLoading;
  const userDoneSwiping = restaurants?.length > 0 && currentIndex >= restaurants.length;

  async function handleLeaveWhileWaiting() {
    if (user?.uid) {
      await leaveRoomRemote(user.uid);
    }
    resetRoom();
    resetRestaurants();
    resetSwipeState();
    navigate('/');
  }

  if (userDoneSwiping && roomStatus === 'SWIPING') {
    return (
      <SwipeWaitingView
        members={members}
        onLeave={handleLeaveWhileWaiting}
      />
    );
  }

  return (
    <SwipeView
      restaurant={currentRestaurant}
      nextRestaurant={nextRestaurant}
      totalRemaining={totalRemaining}
      isLoading={isLoading}
      error={error}
      canSwipe={canSwipe}
      onSwipe={swipeHandlerACB}
      membersPanel={<SwipeMembersPanel members={members} isAdmin={isAdmin} user={user} roomId={roomId} handleKickMember={handleKickMember} leaveSwipe={swipeResetACB} />}
    />
  );
}

export default SwipePresenter;
