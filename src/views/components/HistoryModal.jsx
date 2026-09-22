import { useEffect } from 'react';

/**
 * View: Full-history modal. Pure presentational — receives history array and close callback.
 * Supports an interactive detail view when a match is clicked.
 * Supports an interactive detail view when a match is clicked.
 */
export function HistoryModal({ history, onClose, selectedMatch, onSelectMatch, onViewRoute, onVisitWebsite }) {

  // Lock background scroll while modal is open
  useEffect(() => {
    const htmlEl = document.documentElement;
    const prevHtml = htmlEl.style.overflow;
    const prevBody = document.body.style.overflow;
    htmlEl.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      htmlEl.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content history-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Detail View ─── */}
        {selectedMatch ? (
          <div className="history-detail-view">
            <div className="history-detail-header">
              <button
                className="history-back-btn"
                onClick={() => onSelectMatch(null)}
                aria-label="Back to list"
              >
                ← Back
              </button>
              <button className="history-modal-close" onClick={onClose} aria-label="Close">✕</button>
            </div>

            <div className="history-detail-card">
              <div className="history-detail-image-wrapper">
                <img
                  src={selectedMatch.imageUrl || 'https://via.placeholder.com/400x240?text=Restaurant'}
                  alt={selectedMatch.name}
                  className="history-detail-image"
                />
                {selectedMatch.rating != null && (
                  <span className="history-detail-rating-badge">⭐ {selectedMatch.rating}</span>
                )}
              </div>

              <div className="history-detail-body">
                <h3 className="history-detail-name">{selectedMatch.name}</h3>

                <div className="history-detail-meta">
                  {selectedMatch.cuisineLabel && (
                    <span className="history-detail-chip"> {selectedMatch.cuisineLabel}</span>
                  )}
                  {selectedMatch.priceLabel && (
                    <span className="history-detail-chip"> {selectedMatch.priceLabel}</span>
                  )}
                  {selectedMatch.date && (
                    <span className="history-detail-chip">{selectedMatch.date}</span>
                  )}
                </div>

                {selectedMatch.formattedAddress && (
                  <p className="history-detail-address">📍 {selectedMatch.formattedAddress}</p>
                )}

                {selectedMatch.matchedWith?.length > 0 && (
                  <p className="history-detail-matched-with">
                    Matched with {selectedMatch.matchedWith.join(', ')}
                  </p>
                )}

                <div className="history-detail-actions">
                  <button
                    className="history-action-btn history-route-btn"
                    onClick={() => onViewRoute(selectedMatch.formattedAddress, selectedMatch.name)}
                  >
                    View Route
                  </button>
                  <button
                    className="history-action-btn history-website-btn"
                    onClick={() => onVisitWebsite(selectedMatch.websiteUri)}
                    disabled={!selectedMatch.websiteUri}
                  >
                    Visit Website
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ─── List View ─── */
          <>
            <div className="history-modal-header">
              <h2>All Matches</h2>
              <button className="history-modal-close" onClick={onClose} aria-label="Close">✕</button>
            </div>

            <ul className="history-modal-list">
              {history.map((match, i) => (
                <li
                  key={i}
                  className="history-modal-item"
                  onClick={() => onSelectMatch(match)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSelectMatch(match); }}
                >
                  <img
                    src={match.imageUrl || 'https://via.placeholder.com/60'}
                    alt={match.name}
                    className="history-img"
                  />
                  <div className="history-info">
                    <h4 className="history-name">{match.name}</h4>
                    <p className="history-date">{match.date}</p>
                    {match.matchedWith?.length > 0 && (
                      <p className="history-matched-with">with {match.matchedWith.join(', ')}</p>
                    )}
                  </div>
                  <span className="history-item-chevron" aria-hidden="true">›</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
