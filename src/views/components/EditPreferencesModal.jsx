import React, { useState, useEffect } from 'react';
import '../../index.css';

export function EditPreferencesModal({ 
  isOpen, 
  onClose, 
  onSave, 
  draftFilters,
  onToggleCuisine,
  onTogglePriceLevel,
  onSetRoomName,
  onSetDistance,
  onSetMinRating
}) {
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowMore(false);
      // Lock scrolling on the body
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount or when modal closes
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !draftFilters) return null;

  const mainCuisines = ['Japanese', 'Italian', 'Thai', 'Mexican', 'Indian', 'American', 'Chinese', 'Korean', 'French', 'Vegan'];
  const extraCuisines = ['Mediterranean', 'Seafood', 'Pizza', 'Brunch', 'BBQ', 'Sushi', 'Burgers', 'Steak', 'Ramen', 'Dessert'];
  const visibleCuisines = showMore ? [...mainCuisines, ...extraCuisines] : mainCuisines;

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-content edit-modal">
        <div className="modal-header">
          <h2>Edit Preferences</h2>
          <button className="close-btn" onClick={onClose} title="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="field">
            <label>Room Name</label>
            <input
              className='name-display'
              type="text"
              placeholder="e.g. Friday Dinner"
              maxLength={15}
              value={draftFilters.roomName || ''}
              onChange={(e) => onSetRoomName(e.target.value)}
            />
          </div>

          <div className="field">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Distance
              <span style={{ color: 'var(--color-accent)', fontWeight: '700' }}>{draftFilters.distance || 5} km</span>
            </label>
            <div className="segmented">
              <input
                className="input-range"
                type="range"
                min="1"
                max="20"
                value={draftFilters.distance || 5}
                onChange={(e) => onSetDistance(parseInt(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #FF9A56 ${(draftFilters.distance || 5) * 5}%, #fde7dc 0%)`
                }}
              />
            </div>
          </div>

          <div className="field">
            <label>Cuisine Types</label>
            <div className="chips-grid">
              {visibleCuisines.map(cuisine => {
                const isActive = draftFilters.cuisines?.includes(cuisine);
                return (
                  <button
                    key={cuisine}
                    className={isActive ? "active" : ""}
                    onClick={() => onToggleCuisine(cuisine)}
                  >
                    {cuisine}
                  </button>
                )
              })}
              <button type="button" className="more-btn" onClick={() => setShowMore(!showMore)}>
                <span className="more-btn-text">{showMore ? 'Less' : 'More'}</span>
                {showMore ? (
                  <svg className="more-btn-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg className="more-btn-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="field">
            <label>Price Level</label>
            <div className="segmented-option">
              {[0, 1, 2, 3, 4].map(level => {
                const isAny = level === 0;
                const isActive = isAny
                  ? (draftFilters.priceLevels?.length === 0 || !draftFilters.priceLevels)
                  : draftFilters.priceLevels?.includes(level);
                return (
                  <button
                    key={level}
                    className={isActive ? "active" : ""}
                    onClick={() => onTogglePriceLevel(level)}
                  >
                    {isAny ? 'Any' : '$'.repeat(level)}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label>Minimum Rating</label>
            <div className="rating-options">
              {[0, 3.5, 4.0, 4.5].map(rating => {
                const isActive = draftFilters.minRating === rating;
                return (
                  <button
                    key={rating}
                    onClick={() => onSetMinRating(rating)}
                    className={isActive ? "active" : ""}
                  >
                    {rating === 0 ? 'Any' : rating + '+'}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn big-button" onClick={onSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
