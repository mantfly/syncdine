import TinderCard from 'react-tinder-card';
import { useRef, useEffect } from 'react';
import '../index.css';

/**
 * View: purely presentational (props down, events up).
 *
 * Props:
 *   restaurant      - shaped object: { id, displayName, rating, cuisineLabel, priceLabel, isOpen, closingTime, image, gallery }
 *   nextRestaurant  - the restaurant after the current one (used for stack preview)
 *   totalRemaining  - number of cards left in the queue
 *   isLoading       - bool
 *   error           - string | null
 *   canSwipe        - bool
 *   onSwipe(dir)    - called when card is swiped or button clicked
 *   leaveSwipe()    - leave current swiping room
 */

export function SwipeView({ restaurant, nextRestaurant, totalRemaining, isLoading, error, canSwipe, onSwipe, membersPanel }) {

  const cardRef = useRef(null);

  function swipeButtonHandlerACB(direction) {
    if (!canSwipe) return;

    // Determine which button was pressed and pop it
    const btnClass = direction === 'right' ? 'like-btn' : 'dislike-btn';
    const btn = document.querySelector(`.${btnClass}`);
    if (btn) {
      btn.classList.remove('pressed');
      // Force reflow so the animation retriggers if pressed twice quickly
      void btn.offsetWidth;
      btn.classList.add('pressed');
      btn.addEventListener('animationend', () => btn.classList.remove('pressed'), { once: true });
    }

    if (cardRef.current?.swipe) {
      cardRef.current.swipe(direction);
    } else {
      onSwipe?.(direction);
    }
  }

  

  /** Prevent text selection when dragging the card with mouse */
  function preventDragSelectACB(e) {
    e.preventDefault();
  }

  const heroImage =
    restaurant?.image ||
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80';

  const nextHeroImage =
    nextRestaurant?.image ||
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80';

  /* Show stack behind-cards only when more than 1 card remains */
  const showStack = totalRemaining > 1;

  return (
    <div className="swipe-page">
      <div className="swipe-main">
        <div className="swipe-toolbar">
          
        </div>

        <div className="swipe-content">


          <div className="swipe-card-wrapper">
            <div className="card-stack">
              {isLoading && <p className="status-text">Loading restaurants...</p>}
              {error && <p className="status-text error-text">Error: {error}</p>}

              <div className="card-container">
                {/* ── Behind-card layer 2 (deepest) ── */}
                {showStack && totalRemaining > 2 && (
                  <div className="stack-behind stack-behind--2">
                    <div className="restaurant-card restaurant-card--behind" />
                  </div>
                )}

                {/* ── Behind-card layer 1 (shows next restaurant preview) ── */}
                {showStack && nextRestaurant && (
                  <div className="stack-behind stack-behind--1">
                    <div className="restaurant-card restaurant-card--behind">
                      <div
                        className="restaurant-hero"
                        style={{ backgroundImage: `url(${nextHeroImage})` }}
                      >
                        <div className="restaurant-overlay">
                          <h2 className="restaurant-name">
                            {nextRestaurant.displayName || 'Restaurant name'}
                          </h2>

                          <div className="restaurant-info-row">
                            {nextRestaurant.rating != null && (
                              <span className="rating-badge">⭐ {nextRestaurant.rating}</span>
                            )}
                            <span className="restaurant-meta-text">
                              {nextRestaurant.cuisineLabel || 'Restaurant'} •{' '}
                              {nextRestaurant.priceLabel || ''}
                            </span>
                          </div>

                          {nextRestaurant.isOpen !== null && (
                            <p className="restaurant-open-status">
                              <span style={{ display: 'block', marginBottom: '5px' }}>📍 {restaurant.formattedAddress}</span>
                              <span className={nextRestaurant.isOpen ? (nextRestaurant.closingSoon ? "closing-soon-text" : "open-text") : "closed-text"}>
                                {nextRestaurant.isOpen ? (nextRestaurant.closingSoon ? 'Closing soon' : 'Open') : 'Closed'}
                              </span>
                              {nextRestaurant.closingTime && nextRestaurant.isOpen && (
                                <span> • until {nextRestaurant.closingTime}</span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="swipe-card-actions">
                        <button className="dislike-btn" disabled>
                          ✕ Dislike
                        </button>
                        <button className="like-btn" disabled>
                          ♥ Like
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Active swipeable card (top of stack) ── */}
                {restaurant && (
                  <TinderCard
                    ref={cardRef}
                    key={restaurant.id}
                    onSwipe={(dir) => onSwipe?.(dir)}
                    preventSwipe={['up', 'down']}
                    swipeRequiresTouchOriginOnScreen={true}
                    flickOnSwipe={true}
                  >
                    <div
                      className="restaurant-card"
                      onMouseDown={preventDragSelectACB}
                    >
                      <div
                        className="restaurant-hero"
                        style={{ backgroundImage: `url(${heroImage})` }}
                      >
                        <div className="restaurant-overlay">
                          <h2 className="restaurant-name">
                            {restaurant.displayName || 'Restaurant name'}
                          </h2>

                          <div className="restaurant-info-row">
                            {restaurant.rating != null && (
                              <span className="rating-badge">⭐ {restaurant.rating}</span>
                            )}
                            <span className="restaurant-meta-text">
                              {restaurant.cuisineLabel || 'Restaurant'} •{' '}
                              {restaurant.priceLabel || ''}
                            </span>
                          </div>

                          {restaurant.isOpen !== null && (
                            <p className="restaurant-open-status">
                             <span style={{ display: 'block', marginBottom: '5px' }}>📍 {restaurant.formattedAddress}</span>
                              <span className={restaurant.isOpen ? (restaurant.closingSoon ? "closing-soon-text" : "open-text") : "closed-text"}>
                                {restaurant.isOpen ? (restaurant.closingSoon ? 'Closing soon' : 'Open') : 'Closed'}
                              </span>
                              {restaurant.closingTime && restaurant.isOpen && (
                                <span> • until {restaurant.closingTime}</span>
                              )}
                                
                              
                            </p>
                            
                          )}
                        </div>
                      </div>

                      <div className="swipe-card-actions" key={restaurant.id}>
                        <button
                          className="dislike-btn"
                          onClick={() => swipeButtonHandlerACB('left')}
                          disabled={!canSwipe}
                          onTouchEnd={(e) => {
                            e.stopPropagation();
                            swipeButtonHandlerACB('left');
                          }}
                        >
                          ✕ Dislike
                        </button>

                        <button
                          className="like-btn"
                          onClick={() => swipeButtonHandlerACB('right')}
                          disabled={!canSwipe}
                          onTouchEnd={(e) => {
                            e.stopPropagation();
                            swipeButtonHandlerACB('right');
                          }}
                        >
                          ♥ Like
                        </button>
                      </div>
                    </div>
                  </TinderCard>
                )}

                {!isLoading && !restaurant && !error && (
                  <p className="status-text">No restaurants to show.</p>
                )}
              </div>
            </div>
          </div>


        </div>
      </div>
      
      {membersPanel}
      
    </div>
  );
}


/* photo gallery if needed later
<div className="restaurant-gallery">
                        {gallery.slice(0, 5).map((img, index) => (
                          <img
                            key={index}
                            className="gallery-thumb"
                            src={img}
                            alt={`gallery ${index + 1}`}
                          />
                        ))}
                      </div>*/ 