import { useState, useEffect, useRef } from 'react';
import { HistoryModal } from './components/HistoryModal';

/**
 * View: presentational. userProfile and actions from presenter.
 */
export function ProfileView({
  userProfile,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onNameChange,
  onViewRoute,
  onVisitWebsite,
  history = [],
  previewHistory = [],
  hasMoreHistory = false,
}) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape' && isHistoryOpen) {
        if (selectedMatch) {
          setSelectedMatch(null);
        } else {
          setIsHistoryOpen(false);
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isHistoryOpen, selectedMatch]);

  function handleViewRoute(address, name) {
    const query = onViewRoute(address, name);
    if (query) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`,
        '_blank'
      );
    }
  }

  function handleVisitWebsite(url) {
    const targetUrl = onVisitWebsite(url);
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  }

  function handleCloseHistory() {
    setIsHistoryOpen(false);
    setSelectedMatch(null);
  }
  const name = userProfile?.displayName ?? userProfile?.username ?? 'Anonymous Chef';

  const avatarSeed = userProfile?.avatarSeed ?? 'default_seed';
  const avatarUrl = userProfile?.avatar ? userProfile.avatar : `https://api.dicebear.com/7.x/thumbs/svg?seed=${avatarSeed}`;

  const roomsHosted = userProfile?.roomsHosted ?? 0;
  const matchesFound = userProfile?.matchesFound ?? 0;
  const inputRef = useRef(null);

  return (
    <div className="profile-container">
      {isHistoryOpen && (
        <HistoryModal
          history={history}
          onClose={handleCloseHistory}
          selectedMatch={selectedMatch}
          onSelectMatch={setSelectedMatch}
          onViewRoute={handleViewRoute}
          onVisitWebsite={handleVisitWebsite}
        />
      )}

      <div className="profile-content">

        <div className="profile-hero">
          <div className="avatar-wrapper">
            <img src={avatarUrl} alt="User Avatar" className="avatar-img" />
          </div>
          <div className="profile-name-container">
            {isEditing ? (
              <div className="inline-edit-container">
                <input
                  ref={inputRef}
                  type="text"
                  defaultValue={name}
                  maxLength="20"
                  autoFocus
                  className="inline-name-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onNameChange(e.target.value);
                    if (e.key === 'Escape') onCancelEdit();
                  }}
                />
                <div className="inline-edit-actions">
                  <button className="inline-save-btn" onClick={() => onNameChange(inputRef.current.value)} title="Save">✓</button>
                  <button className="inline-cancel-btn" onClick={onCancelEdit} title="Cancel">✕</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="profile-name">{name}</h2>
                <button className="edit-name-btn" onClick={onStartEdit} title="Edit Name">
                  ✎
                </button>
              </>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-number">{roomsHosted}</div>
            <div className="stat-label">Rooms Hosted</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{matchesFound}</div>
            <div className="stat-label">Matches Found</div>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-header">
            <h3>Recent Matches</h3>
            {hasMoreHistory && (
              <button className="see-all-btn" onClick={() => setIsHistoryOpen(true)}>
                See all {history.length} →
              </button>
            )}
          </div>
          <div className="history-list">
            {previewHistory.length > 0 ? (
              previewHistory.map((match, i) => (
                <div
                  key={i}
                  className="history-card history-card-clickable"
                  onClick={() => { setSelectedMatch(match); setIsHistoryOpen(true); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setSelectedMatch(match); setIsHistoryOpen(true); } }}
                >
                  <img src={match.imageUrl || 'https://via.placeholder.com/60'} alt={match.name} className="history-img" />
                  <div className="history-info">
                    <h4 className="history-name">{match.name}</h4>
                    <p className="history-date">{match.date}</p>
                    {match.matchedWith?.length > 0 && (
                      <p className="history-matched-with">with {match.matchedWith.join(', ')}</p>
                    )}
                  </div>
                  <span className="history-item-chevron" aria-hidden="true">›</span>
                </div>
              ))
            ) : (
              <div className="empty-state">No matches found yet. Start a room to find your first match!</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
