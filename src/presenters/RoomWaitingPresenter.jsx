import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoomPresenter } from './useRoomPresenter';
import { RoomWaitingView } from '../views/RoomWaitingView';
import { getRoomErrorMessage } from '../utils/errorTranslator';
import { writeToClipboard } from '../utils/clipboardUtils';

function RoomWaitingPresenter({ model }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const {
    subscribeToRoom,
    handleLeaveRoom,
    deleteRoom,
    handleKickMember,
    handleToggleReady,
    handleStartSwiping,
    resetRoom,
    roomCode,
    members,
    isAdmin,
    status,
    filters,
    joinRoom
  } = useRoomPresenter(model);

  const user = model.user.user;
  const profile = model.user.profile;

  // Prevent the auto-join effect from firing more than once
  const hasAttemptedAutoJoin = useRef(false);

  // --- Auto-join: if the user arrived via a shared link, add them to the room ---
  useEffect(() => {
    if (!roomId || !user || hasAttemptedAutoJoin.current) return;
    hasAttemptedAutoJoin.current = true;

    const enrichedUser = {
      ...user,
      displayName: profile?.username || user.displayName || 'Guest',
      photoURL: profile?.avatar || user.photoURL || null,
    };

    (async () => {
      const result = await joinRoom(enrichedUser, roomId);
      if (!result.ok) {
        const friendlyMsg = getRoomErrorMessage(result.reason);
        model.user.setToast(friendlyMsg, 'error');
        navigate('/');
      }
    })();
  }, [roomId, user]);

  // Track latest state in a ref specifically for the unmount cleanup below
  const latestState = useRef({ isAdmin, status, roomId, userId: user?.uid });
  useEffect(() => {
    latestState.current = { isAdmin, status, roomId, userId: user?.uid };
  }, [isAdmin, status, roomId, user?.uid]);

  const currUserId = user?.uid;

  const handleVisibilityChange = (isAway) => {
    // Ensure we are still in the same room before updating
    if (model.room.roomId === roomId && currUserId) {
      model.room.setUserAway(roomId, currUserId, isAway);
    }
  };


  useEffect(() => {
    let unsubscribe;
    if (roomId) {
      unsubscribe = subscribeToRoom(roomId);
    }


    const handleVisibilityChange = () => {
      const isAway = document.visibilityState === 'hidden';
      // Ensure we are still in the same room before updating
      if (model.room.roomId === roomId && currUserId) {
        model.room.setUserAway(roomId, currUserId, isAway);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (unsubscribe) unsubscribe();

      // Note: We do NOT call handleUnload() here. 
      // This ensures the user STAYS in the room if they just route away within the app.
      // However, we DO mark them as 'away' so others know they navigated to another page.
      // If store.roomId is null, it means they clicked 'Leave' and the room was reset.
      // In that case, we don't need to mark them away.
      if (model.room.roomId === roomId && currUserId && model.room.status === 'LOBBY') {
        model.room.setUserAway(roomId, currUserId, true);
      }
    };
  }, [roomId, user?.uid]);

  // Robustly ensure the user is marked as present if they are actively on this page
  useEffect(() => {
    if (!roomId || !user?.uid || !members) return;
    const currentUser = members.find(m => m.uid === user.uid);
    if (currentUser?.isAway && document.visibilityState === 'visible') {
      model.room.setUserAway(roomId, user.uid, false);
    }
  }, [roomId, user?.uid, members]);

  useEffect(() => {
    if (status === "SWIPING" && roomId) {
      navigate(`/room/${roomId}/swipe`);
    }
  }, [status, roomId, navigate]);

  useEffect(() => {
    if (!isAdmin || !roomId || !members || members.length === 0) return;
    const everyoneReady = members.every((member) => Boolean(member.isReady));
    if (everyoneReady && status === "LOBBY") {
      handleStartSwiping(roomId);
    }
  }, [isAdmin, roomId, members, status, handleStartSwiping]);

  const handleCopyCode = async () => {
    const result = await writeToClipboard(roomCode);
    if (result.ok) {
      model.user.setToast('Room Code copied to clipboard!', 'success');
    } else {
      model.user.setToast('Failed to copy room code', 'error');
    }
  };

  const handleCopyLink = async (origin) => {
    const shareableLink = `${origin}/room/${roomId}`;
    const result = await writeToClipboard(shareableLink);
    if (result.ok) {
      model.user.setToast('Room Link copied to clipboard!', 'success');
    } else {
      model.user.setToast('Failed to copy room link', 'error');
    }
  };

  useEffect(() => {
    return () => {
      resetRoom();
      console.log("Resetting room state");
    };
  }, []);

  const onToggleReady = () => handleToggleReady(roomId);

  // Derived display string — computed here in the Presenter, not in the View
  const priceLevelsLabel = filters?.priceLevels?.length > 0
    ? [...filters.priceLevels].sort().map(l => '$'.repeat(l)).join(' / ')
    : 'Any';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(null);
  
  const handleOpenEditModal = () => {
    setDraftFilters({ ...filters }); // Initialize draft from model
    setIsEditModalOpen(true);
  };
  
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setDraftFilters(null);
  };

  const { handleUpdateRoomFilters } = useRoomPresenter(model);

  const handleSavePreferences = () => {
    if (draftFilters) {
      handleUpdateRoomFilters(roomId, draftFilters);
    }
    handleCloseEditModal();
  };

  // Logic moved from View to Presenter for Strict MVP
  const toggleCuisineDraft = (cuisine) => {
    setDraftFilters(prev => {
      const currentList = prev.cuisines || [];
      const newList = currentList.includes(cuisine)
        ? currentList.filter(c => c !== cuisine)
        : [...currentList, cuisine];
      return { ...prev, cuisines: newList };
    });
  };

  const togglePriceLevelDraft = (level) => {
    setDraftFilters(prev => {
      if (level === 0) return { ...prev, priceLevels: [] };
      const current = prev.priceLevels || [];
      const newList = current.includes(level)
        ? current.filter(l => l !== level)
        : [...current, level];
      return { ...prev, priceLevels: newList };
    });
  };

  const setDraftRoomName = (name) => {
    setDraftFilters(prev => ({ ...prev, roomName: name }));
  };

  const setDraftDistance = (dist) => {
    setDraftFilters(prev => ({ ...prev, distance: dist }));
  };

  const setDraftMinRating = (rating) => {
    setDraftFilters(prev => ({ ...prev, minRating: rating }));
  };

  return (
    <RoomWaitingView
      roomName={filters?.roomName || 'Dining Room'}
      roomId={roomId}
      roomCode={roomCode}
      members={members}
      isAdmin={isAdmin}
      status={status}
      filters={filters}
      user={user}
      handleLeaveRoom={handleLeaveRoom}
      handleKickMember={handleKickMember}
      handleToggleReady={onToggleReady}
      handleCopyCode={handleCopyCode}
      handleCopyLink={handleCopyLink}
      priceLevelsLabel={priceLevelsLabel}
      
      // Edit Modal Props (Presenter -> View)
      isEditModalOpen={isEditModalOpen}
      onOpenEditModal={handleOpenEditModal}
      onCloseEditModal={handleCloseEditModal}
      onSavePreferences={handleSavePreferences}
      
      // Draft State & Logic (Presenter -> View)
      draftFilters={draftFilters}
      onToggleCuisine={toggleCuisineDraft}
      onTogglePriceLevel={togglePriceLevelDraft}
      onSetRoomName={setDraftRoomName}
      onSetDistance={setDraftDistance}
      onSetMinRating={setDraftMinRating}
      onVisibilityChange={handleVisibilityChange}
    />
  );
}
export default RoomWaitingPresenter;