export default function RestaurantCard({ restaurant, onSwipeRight, onSwipeLeft }) {
    return (
        <div className="restaurant-card">
            <img src={restaurant?.imageUrl} alt={restaurant?.name} />
            <h3>{restaurant?.name}</h3>
            <p>Rating: {restaurant?.rating}</p>
            {onSwipeLeft && <button onClick={onSwipeLeft}>Nope</button>}
            {onSwipeRight && <button onClick={onSwipeRight}>Like</button>}
        </div>
    );
}
