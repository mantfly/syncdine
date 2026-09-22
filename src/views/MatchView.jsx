/**
 * View: presentational. Shows match info and map container; route/loadMapRoute from presenter.
 */
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export function MatchView({ matchedRestaurant, onViewRoute, onLeave }) {
  if (!matchedRestaurant) {
    return <p className="match-empty">No match found.</p>;
  }

  // --- Animation Effects ---
  useEffect(() => {
    if (matchedRestaurant) {
      // Create a celebratory confetti burst
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 10000, scalar: 1.2 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 80 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [matchedRestaurant]);

  function handleViewRoute() {
    const query = onViewRoute();
    if (query) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`,
        '_blank'
      );
    }
  }

  function handleVisitWebsite() {
    if (matchedRestaurant?.websiteUri) {
      window.open(matchedRestaurant.websiteUri, '_blank');
    }
  }

  return (
    <div className="match-page">
      <main className="match-main">
        <section className="match-banner">
          <h1>It&apos;s a Match!</h1>
        </section>

        <section className="match-card">
          <div className="match-card-image-wrapper">
            <img
              className="match-card-image"
              src={
                matchedRestaurant?.image ||
                'https://via.placeholder.com/400x300?text=Restaurant+Image'
              }
              alt={matchedRestaurant?.name || 'Restaurant'}
            />
          </div>

          <div className="match-card-body">
            <div className="match-card-info">
              <div className="match-card-left">
                <h2 className="match-restaurant-name">
                  {matchedRestaurant?.name || matchedRestaurant?.displayName || 'Restaurant'}
                </h2>

                <p className="match-restaurant-meta">
                  🍴 {matchedRestaurant?.cuisineLabel || 'Restaurant'}
                  {' • '}
                  {matchedRestaurant?.priceLabel || ''}
                  {matchedRestaurant?.area ? ` • ${matchedRestaurant.area}` : ''}
                  <span style={{ display: 'block', marginTop: '7px' }}>📍 {matchedRestaurant.formattedAddress}</span>
                </p>
              </div>

              <div className="match-card-right">
                <div className="match-rating-badge">
                  ☆ {matchedRestaurant?.rating ?? ''}
                </div>

                <p className="match-liked-text">
                  {matchedRestaurant?.likesText || ''}
                </p>
              </div>
            </div>

            <div className="match-card-actions">
              <button className="match-action-btn route-btn" onClick={handleViewRoute}>
                View Route
              </button>

              <button
                className="match-action-btn visit-btn"
                onClick={handleVisitWebsite} disabled={!matchedRestaurant?.websiteUri}
              >
                Visit Website
              </button>

              <button
                className="match-action-btn leave-btn"
                onClick={onLeave}
              >
                Back To Menu
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
