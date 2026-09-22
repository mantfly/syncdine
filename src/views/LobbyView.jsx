/**
 * Lobby / landing: welcome, avatar, join room (controlled code) + create room.
 */
export function LobbyView({
  displayName,
  avatarUrl,
  joinCode,
  setJoinCode,
  onJoinSubmit,
  onCreateRoom,
  error,
}) {
  return (
    <div className="landing">
      <div className="landing-container">
        

        <div className="auth-error-toast" role="alert" aria-live="polite" style={{ marginBottom: '1rem', marginTop: '-0.5rem' }}>
          {error && <>⚠️ {error}</>}
        </div>

          <div className="landing-card">
<h1>Welcome {displayName}!</h1>
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" className="home-user-avatar" />
        ) : null}
  
        <div className="landing-text">
          <form onSubmit={onJoinSubmit} className="landing-join-form">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              maxLength={5}
              className="input-room"
            />
            <button type="submit" className="big-button">
              Join
            </button>
          </form>

          <div className="divider-row">
            <div className="horizontal-divider" />
            <span className="landing-label">Or</span>
            <div className="horizontal-divider" />
          </div>

          <button type="button" onClick={onCreateRoom} className="big-button">
            Create Room
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
