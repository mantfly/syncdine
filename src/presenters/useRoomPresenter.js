import { useNavigate } from 'react-router-dom';

export function useRoomPresenter(model) {
  const fetchRoomLocation = model.room.fetchRoomLocation;
  const roomLocation = model.room.roomLocation;
  const navigate = useNavigate();
  const user = model.user.user;
  const profile = model.user.profile;
  const {
    roomCode,
    members,
    status,
    isAdmin,
    filters,
    previewCode,
    joinCode,
    setJoinCode,
    createRoom,
    joinRoom,
    subscribeToRoom: subscribeToRoomModel,
    leaveRoomRemote,
    deleteRoomById,
    kickMember,
    toggleReady,
    updateMemberLocation,
    startSwipingIfReady,
    resetRoom,
    setManualLocation,
    addressSuggestions,
    autocompleteAddress,
    selectAddressSuggestion,
    manualAddressInput,
    setManualAddressInput,
    updateRoomFilters
  } = model.room;
  const setFilters = model.room.setFilters;
  const initializeCreateRoomDraft = model.room.initializeCreateRoomDraft;

  const handleCreateRoom = async (previewCode) => {
    if (!user) return;
    // Merge auth user with profile so the store has the real username/avatar
    const enrichedUser = {
      ...user,
      displayName: profile?.displayName || profile?.username || user.displayName || 'Guest',
      photoURL: profile?.avatar || user.photoURL || null,
    };
    const roomId = await createRoom(enrichedUser, previewCode);
    if (roomId) navigate(`/room/${roomId}`);
  };

  const handleJoinRoom = async (inputCode) => {
    if (!user || !inputCode) return;
    const enrichedUser = {
      ...user,
      displayName: profile?.displayName || profile?.username || user.displayName || 'Guest',
      photoURL: profile?.avatar || user.photoURL || null,
    };
    const result = await joinRoom(enrichedUser, inputCode);
    if (!result.ok) {
      model.user.setToast("Room does not exist!", "error");
      return;
    }
    navigate(`/room/${result.code}`);
  };

  const subscribeToRoom = (code) => {
    if (!user) return null;
    return subscribeToRoomModel(code, user.uid, (wasAdmin, wasKicked) => {
      if (wasKicked) {
        model.user.setToast("You have been kicked from the room.", "error");
      } else if (!wasAdmin) {
        model.room.setRoomError("The session has ended because the host left the room.");
      }
      navigate('/');
    });
  };

  const deleteRoom = async (roomId, userId) => {
    if (!roomId) return;
    await deleteRoomById(roomId, userId);
  };

  const handleLeaveRoom = async () => {
    if (!user) return;
    await leaveRoomRemote(user.uid);
    // Clean up local state and navigate away
    resetRoom();
    navigate('/');
  };

  const handleKickMember = async (roomId, targetUserId) => {
    if (!user || !roomId || !targetUserId) return;
    await kickMember(roomId, targetUserId);
  };

  const handleToggleReady = async (roomId) => {
    if (!user || !roomId) return;
    await toggleReady(roomId, user.uid);
  };

  const handleUpdateLocation = async (roomId, locationData) => {
    if (!user || !roomId || !members) return;

    if (locationData.error) {
      model.user.setToast(locationData.error, "error");
      return;
    }

    if (locationData.latitude && locationData.longitude) {
      await updateMemberLocation(roomId, user.uid, locationData.latitude, locationData.longitude);
    }
  };

  const handleStartSwiping = async (roomId) => {
    await startSwipingIfReady(roomId);
  };

  const handleUpdateRoomFilters = async (roomId, newFilters) => {
    await updateRoomFilters(roomId, newFilters);
  };

  return {
    handleCreateRoom,
    handleJoinRoom,
    subscribeToRoom,
    deleteRoom,
    handleLeaveRoom,
    handleKickMember,
    handleToggleReady,
    handleUpdateLocation,
    handleStartSwiping,
    handleUpdateRoomFilters,
    roomCode,
    members,
    status,
    isAdmin,
    filters,
    previewCode,
    joinCode,
    setJoinCode,
    setFilters,
    initializeCreateRoomDraft,
    resetRoom,
    fetchRoomLocation,
    roomLocation,
    setManualLocation,
    addressSuggestions,
    autocompleteAddress,
    selectAddressSuggestion,
    joinRoom,
    manualAddressInput,
    setManualAddressInput
  };
}

