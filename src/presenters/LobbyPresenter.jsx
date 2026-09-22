import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomPresenter } from './useRoomPresenter';
import { LobbyView } from '../views/LobbyView';

/**
 * Landing / lobby: welcome + join room (5-char code) + create room flow.
 */
function LobbyPresenter({ model }) {
  const navigate = useNavigate();
  const { handleJoinRoom, joinCode, setJoinCode } = useRoomPresenter(model);

  const error = model.room.error;
  const clearRoomError = model.room.clearRoomError;

  // Auto-clear notification error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearRoomError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearRoomError]);

  const rawName = model.user.profile?.displayName ?? model.user.profile?.username ?? 'Guest';
  const displayName = rawName.split(' ')[0]; // Use first name only
  const avatarUrl =
    model.user.profile?.avatar ??
    model.user.user?.photoURL ??
    '';

  function onJoinSubmit(e) {
    e.preventDefault();
    const code = joinCode.trim();
    if (code.length === 5) {
      handleJoinRoom(code);
    } else {
      model.user.setToast('Room code must be exactly 5 characters long.', 'error');
    }
  }

  function navToCreateRoom() {
    navigate('/create-room');
  }

  return (
    <div className="app-home-bg">
      <LobbyView
        displayName={displayName}
        avatarUrl={avatarUrl}
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        onJoinSubmit={onJoinSubmit}
        onCreateRoom={navToCreateRoom}
        error={error}
      />
    </div>
  );
}
export default LobbyPresenter;