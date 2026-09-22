import React, { useState } from 'react';
import '../index.css';


export function CreateRoomView({ filters, setFilters, previewCode, toggleCuisine,
  onPreCreate, onFetchLocation, roomLocation, addressSuggestions, handleAddressType,
  handleAddressSelect, addressInput, mainCuisines, extraCuisines, togglePriceLevel }) {

  const [showMore, setShowMore] = useState(false);
  const visibleCuisines = showMore ? [...mainCuisines, ...extraCuisines] : mainCuisines;
  const onToggleShowMore = () => setShowMore(prev => !prev);

  return (
    <div className="create-room-screen">
      {/* Hero / Subtitle */}
      <div className="hero">
        <h2>Create New Room</h2>
        <p>Set up your dining room and invite friends to start syncing.</p>
      </div>

      {/* Form Section */}
      <div className="form-section">
        {/* Room Details Group */}
        <div className="white-card">
          <h3>Room Details</h3>

          <div className="field">
            <label>Room Name</label>
            <input
              className='name-display'
              type="text"
              placeholder="e.g. Friday Dinner"
              maxLength={15}
              value={filters?.roomName || ''}
              onChange={(e) => setFilters({ roomName: e.target.value })}
            />
          </div>
          {/* Room Location */}
          <div className="field">
            <label>Room Location</label>

            <button className="big-button" onClick={onFetchLocation}>
              {roomLocation && !roomLocation.address ? 'Location set ✓' : 'Use my current location'}
            </button>
            <span style={{ textAlign: 'center' }}>OR</span>
            {/* Manual Location Input */}
            <div className='manualLocation'>
              <input
                type="text"
                placeholder='Enter Location Manually'
                className='manualLocationText'
                value={addressInput}
                onChange={(e) => handleAddressType(e.target.value)}
              />

              {/* Suggestions Dropdown */}
              {addressSuggestions && addressSuggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {addressSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.placePrediction.placeId}
                      onClick={() => handleAddressSelect(suggestion.placePrediction.placeId, suggestion.placePrediction.text.text)}
                    >
                      {suggestion.placePrediction.text.text}
                    </div>
                  ))}
                </div>
              )}



            </div>

          </div>
        </div>



        {/* Preferences Group */}

        <div className="white-card">
          <h3>Preference</h3>

          {/* Distance */}
          <div className="field">
            <label>
              Distance: <span>{filters?.distance || 5} km</span>
            </label>
            <div className="segmented">
              <input
                className="input-range"
                type="range"
                min="1"
                max="20"
                value={filters?.distance || 5}
                onChange={(e) => setFilters({ distance: parseInt(e.target.value) })}
                style={{
                  background: `linear-gradient(to right, #FF9A56 ${(filters?.distance || 5) * 4.8}%, #fde7dc 0%)`
                }}
              />
            </div>
          </div>

          {/* Cuisine Types */}
          <div className="field">
            <label>Cuisine Types</label>
            <div className="chips-grid">
              {visibleCuisines.map(cuisine => {
                const isActive = filters?.cuisines?.includes(cuisine);
                return (
                  <button
                    key={cuisine}
                    className={isActive ? "active" : ""}
                    onClick={() => toggleCuisine(cuisine)}
                  >
                    {cuisine}
                  </button>
                )
              })}
              <button
                  type="button"
                  className="more-btn"
                  onClick={onToggleShowMore}
                >
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

          {/* Price Level */}
          <div className="field">
            <label>Price Level</label>
            <div className="segmented-option">
              {[0, 1, 2, 3, 4].map(level => {
                const isAny = level === 0;
                const isActive = isAny
                  ? (filters?.priceLevels?.length === 0)
                  : filters?.priceLevels?.includes(level);
                return (
                  <button
                    key={level}
                    className={isActive ? "active" : ""}
                    onClick={() => togglePriceLevel(level)}
                  >
                    {isAny ? 'Any' : '$'.repeat(level)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Rating */}
          <div className="field">
            <label>Minimum Rating</label>
            <div className="rating-options">
              {[0, 3.5, 4.0, 4.5].map(rating => {
                const isActive = filters?.minRating === rating;
                return (
                  <button
                    key={rating}
                    onClick={() => setFilters({ minRating: rating })}
                    className={isActive ? "active" : ""}
                  >
                    {rating === 0 ? 'Any' : rating + '+'}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <button className="big-button" onClick={onPreCreate}>
          Create and Join Room
        </button>
      </div>
    </div>
  );
}
