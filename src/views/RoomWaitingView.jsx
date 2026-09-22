import React, { useEffect } from 'react';
import leave from '../img/leave.svg';
import { EditPreferencesModal } from './components/EditPreferencesModal';

export function RoomWaitingView({
  roomName,
  roomId,
  roomCode,
  members,
  isAdmin,
  status,
  filters,
  user,
  handleLeaveRoom,
  handleKickMember,
  handleToggleReady,
  handleCopyCode,
  handleCopyLink,
  priceLevelsLabel,
  isEditModalOpen,
  onOpenEditModal,
  onCloseEditModal,
  onSavePreferences,
  draftFilters,
  onToggleCuisine,
  onTogglePriceLevel,
  onSetRoomName,
  onSetDistance,
  onSetMinRating,
  onVisibilityChange,
}) {
  function handleCopyLinkWrapper() {
    handleCopyLink(window.location.origin);
  }

  useEffect(() => {
    const handleVisibilityChangeWrapper = () => {
      onVisibilityChange(document.visibilityState === 'hidden');
    };

    if (onVisibilityChange) document.addEventListener('visibilitychange', handleVisibilityChangeWrapper);

    return () => {
      if (onVisibilityChange) document.removeEventListener('visibilitychange', handleVisibilityChangeWrapper);
    };
  }, [onVisibilityChange]);

  if (!roomCode || roomCode !== roomId) {
    return (
      <div>
        <p>Connecting to Room Lobby...</p>
      </div>
    );
  }

  const readyCount = members?.filter(m => m.isReady).length || 0;
  const totalMembers = members?.length || 0;

  const currentUserObj = members?.find(m => m.uid === user?.uid);
  const isCurrentUserReady = currentUserObj?.isReady || false;

  return (
    <div className='room-page'>
      <main className="room-layout">
        <div className="room-content-wrapper">
          <div className="room-header">
            <h1>{filters?.roomName || 'Dinner Room'}</h1>
            <div className="room-actions">
              <button className="action-btn" onClick={handleCopyCode}>
                <svg className="btn-icon" viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <path id="Vector" d="M9 13.5L15 16.5M15 7.5L9 10.5M18 21C16.3431 21 15 19.6569 15 18C15 16.3431 16.3431 15 18 15C19.6569 15 21 16.3431 21 18C21 19.6569 19.6569 21 18 21ZM6 15C4.34315 15 3 13.6569 3 12C3 10.3431 4.34315 9 6 9C7.65685 9 9 10.3431 9 12C9 13.6569 7.65685 15 6 15ZM18 9C16.3431 9 15 7.65685 15 6C15 4.34315 16.3431 3 18 3C19.6569 3 21 4.34315 21 6C21 7.65685 19.6569 9 18 9Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copy Code ({roomCode})
              </button>
              <button className="action-btn" onClick={handleCopyLinkWrapper}>
                <svg className="btn-icon" viewBox="0 0 24 24" width="18" height="18" fill="none">
                  <path d="M13.544 10.456a4.368 4.368 0 0 0-6.176 0l-3.089 3.088a4.367 4.367 0 1 0 6.176 6.176L12 18.175" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.456 13.544a4.368 4.368 0 0 0 6.176 0l3.089-3.088a4.367 4.367 0 1 0-6.176-6.176L12 5.825" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Copy Link
              </button>
              <button className="action-btn" onClick={() => handleLeaveRoom()}>
                <img src={leave} className="btn-icon" alt="Leave" />
                Leave
              </button>
            </div>
          </div>

          <aside className='room-sidebar'>
            <div className='summary-card'>
              <div className="summary-header">
                <h2>Room Details</h2>
                {isAdmin && (
                  <button className="edit-room-action" onClick={onOpenEditModal}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                  </button>
                )}
              </div>

              <div className="summary-section">
                <p className="summary-label">SEARCH PREFERENCES</p>
                <div className="summary-box">
                  <div className='summary-item'>
                    <span className='value'>{filters?.distance || 5} km</span>
                    <span className='sub-label'>Distance</span>
                  </div>
                  <div className='divider'></div>
                  <div className='summary-item'>
                    <span className='value'>{priceLevelsLabel}</span>
                    <span className='sub-label'>Price</span>
                  </div>
                  <div className='divider'></div>
                  <div className='summary-item'>
                    <span className='value'>{filters?.minRating ? `${filters.minRating}+` : 'Any'}</span>
                    <span className='sub-label'>Rating</span>
                  </div>
                </div>
              </div>

              <div className="summary-section">
                <p className="summary-label">CUISINES</p>
                <div className="summary-box-2">
                  {filters?.cuisines?.length > 0 ? (
                    filters.cuisines.map(c => (
                      <span className='label' key={c}>{c}</span>
                    ))
                  ) : (
                    <span className='label empty-label'>Any</span>
                  )}
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="ready-row">
                <h3>Participants Ready</h3>
                <span>{readyCount} / {totalMembers}</span>
              </div>

              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${totalMembers > 0 ? (readyCount / totalMembers) * 100 : 0}%` }} />
              </div>

              <ul>
                {members?.map((member) => (
                  <li key={member.uid}>
                    <div>
                      {member.photo ? (
                        <img src={member.photo} alt={member.name} width="40" height="40" />
                      ) : (
                        <div className="avatar-placeholder">
                          {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                      <span className="participant-name">{member.name || 'Anonymous'}</span>
                      {isAdmin && member.uid !== user?.uid && (
                        <button
                          className="kick-btn"
                          onClick={() => handleKickMember(roomId, member.uid)}
                        >x
                        </button>
                      )}
                    </div>
                    <div className="participant-right-side" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className={`participant-status ${member.isAway ? 'away' : member.isReady ? 'ready' : 'waiting'}`}>
                        {member.isAway ? '(Away)' : member.isReady ? '(Ready)' : '(Waiting)'}
                      </div>

                    </div>
                  </li>
                ))}
              </ul>

              <div className="room-footer-actions">
                {status === 'FINISHED' ? (
                  <div>
                    <h4>Match Found!</h4>
                    {isAdmin && (
                      <button className="big-button" onClick={() => handleLeaveRoom()}>
                        Close Session
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="status-message">
                      {readyCount === totalMembers && totalMembers > 0
                        ? "All participants are ready. Starting swiping phase..."
                        : "Waiting for all participants to be ready..."}
                    </p>
                    <button className={`big-button ${isCurrentUserReady ? 'active' : ''}`} onClick={() => handleToggleReady(roomId)}>
                      {isCurrentUserReady ? "I'm Ready! (Click to unready)" : "Mark as Ready"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <EditPreferencesModal
        isOpen={isEditModalOpen}
        onClose={onCloseEditModal}
        onSave={onSavePreferences}
        draftFilters={draftFilters}
        onToggleCuisine={onToggleCuisine}
        onTogglePriceLevel={onTogglePriceLevel}
        onSetRoomName={onSetRoomName}
        onSetDistance={onSetDistance}
        onSetMinRating={onSetMinRating}
      />
    </div>
  );
}
