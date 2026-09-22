import { useState } from 'react';

/**
 * View: shows a list of restaurants that received partial votes (no full match).
 *
 * Props:
 *   restaurants - array of { restaurant, voteCount, memberCount }
 *   onViewRoute(restaurant) - opens Google Maps for the restaurant
 *   onVisitWebsite(restaurant) - opens the restaurant's website
 *   onLeave() - return to lobby
 */
export function SuggestionView({ restaurants, onViewRoute, onVisitWebsite, onLeave }) {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_COUNT = 3;
  const visibleRestaurants = showAll ? restaurants : restaurants.slice(0, INITIAL_COUNT);

  function handleViewRoute(restaurant) {
    const query = onViewRoute(restaurant);
    if (query) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
        '_blank'
      );
    }
  }

  function handleVisitWebsite(restaurant) {
    const url = onVisitWebsite(restaurant);
    if (url) {
      window.open(url, '_blank');
    }
  }

  return (
    <div className="no-match-page">
      <main className="no-match-main">
        <section className="no-match-banner">
          <h1>No Perfect Match</h1>
          <p className="no-match-subtitle">
            No restaurant got everyone's vote, but here are your group's top picks!
          </p>
          <button className="match-action-btn leave-btn no-match-leave-btn" onClick={onLeave}>
            Back To Menu
          </button>
        </section>

        <section className="no-match-list">
          {restaurants.length === 0 && (
            <p className="no-match-empty">No restaurants received any votes.</p>
          )}

          {visibleRestaurants.map(({ restaurant, voteCount, memberCount }) => (
            <div className="no-match-card" key={restaurant.id}>
              <div className="no-match-card-image-wrapper">
                <img
                  className="no-match-card-image"
                  src={
                    restaurant.image ||
                    'https://via.placeholder.com/400x300?text=Restaurant+Image'
                  }
                  alt={restaurant.displayName || restaurant.name || 'Restaurant'}
                />
              </div>

              <div className="no-match-card-body">
                <div className="no-match-card-info">
                  <div className="no-match-card-left">
                    <h2 className="no-match-restaurant-name">
                      {restaurant.displayName || restaurant.name || 'Restaurant'}
                    </h2>
                    <p className="no-match-restaurant-meta">
                      🍴 {restaurant.cuisineLabel || 'Restaurant'}
                      {' • '}
                      {restaurant.priceLabel || ''}
                      {restaurant.area ? ` • ${restaurant.area}` : ''}
                    </p>
                  </div>

                  <div className="no-match-card-right">
                    {restaurant.rating != null && (
                      <div className="no-match-rating-badge">
                        ☆ {restaurant.rating}
                      </div>
                    )}
                    <p className="no-match-vote-text">
                      {voteCount}/{memberCount} voted yes
                    </p>
                  </div>
                </div>

                <div className="no-match-card-actions">
                  <button
                    className="match-action-btn route-btn"
                    onClick={() => handleViewRoute(restaurant)}
                  >
                    View Route
                  </button>
                  {restaurant.websiteUri && (
                    <button
                      className="match-action-btn book-btn"
                      onClick={() => handleVisitWebsite(restaurant)}
                    >
                      Visit Website
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {!showAll && restaurants.length > INITIAL_COUNT && (
            <button
              className="match-action-btn no-match-show-more-btn"
              onClick={() => setShowAll(true)}
            >
              Show More ({restaurants.length - INITIAL_COUNT} more)
            </button>
          )}
        </section>
      </main>
    </div>
  );
}