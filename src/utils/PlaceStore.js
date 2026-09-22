//utility file for resolving restaurant searching using the PlacesAPI. 
//It is used by the RoomPresenter to fetch and filter restaurants.

import { fetchRestaurantsNearby, getPlacePhotoUrl } from '../api/PlacesApi';

// ---------------------------------------------------------------------------
// This is where restaurants are filtered
// ---------------------------------------------------------------------------
const GENERIC_TYPES = new Set([
  'restaurant', 'food', 'point_of_interest',
  'establishment', 'bar', 'lodging', 'hotel',
]);

function deriveCuisineLabel(place) {
  const types = place.types || [];
  const primary = place.primaryType;

  let cuisineType = primary && !GENERIC_TYPES.has(primary) ? primary : null;

  if (!cuisineType) {
    cuisineType =
      types.find((t) => t.endsWith('_restaurant') && !GENERIC_TYPES.has(t)) ||
      types.find((t) => !GENERIC_TYPES.has(t)) ||
      null;
  }

  if (!cuisineType) return null;

  return cuisineType
    .replace(/_restaurant$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Price level utility (moved from SwipeView — this is data transformation)
// ---------------------------------------------------------------------------
const PRICE_LEVEL_MAP = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

function derivePriceLevel(raw) {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') return PRICE_LEVEL_MAP[raw] ?? null;
  return null;
}

function derivePriceLabel(raw) {
  const level = derivePriceLevel(raw);
  if (level === null) return null;
  const count = Math.max(1, Math.min(4, level));
  return '$'.repeat(count);
}

// ---------------------------------------------------------------------------
// Restaurant ID utility (moved from SwipePresenter — this is model concern)
// ---------------------------------------------------------------------------
export function getRestaurantId(restaurant) {
  return (
    restaurant?.id ||
    restaurant?.placeId ||
    restaurant?.name ||
    restaurant?.displayName?.text ||
    null
  );
}

// ---------------------------------------------------------------------------
// Shape a raw Places API place into a clean object the view can render
// directly, with no further transformation needed.
// ---------------------------------------------------------------------------
function shapeRestaurant(place) {
  return {
    // Stable identity used as React key and for swipe decisions
    id: getRestaurantId(place),

    // Display-ready strings — the view just renders these, no logic needed
    displayName: place.displayName?.text || place.name || 'Unknown',
    rating: typeof place.rating === 'number' ? place.rating.toFixed(1) : place.rating ?? null,
    cuisineLabel: deriveCuisineLabel(place),
    priceLabel: derivePriceLabel(place.priceLevel),

    // Keep numeric price level so the model can filter on it
    _priceLevel: derivePriceLevel(place.priceLevel),

    // Photo URL — use the first photo's resource name to build a media URL
    image: getPlacePhotoUrl(place.photos?.[0]?.name, 600),

    // Used by MatchView for "View Route" and "Visit Website"
    formattedAddress: place.formattedAddress || null,
    websiteUri: place.websiteUri || null,
    
    // Status
    isOpen: place.regularOpeningHours?.openNow ?? null,
  };
}

// ---------------------------------------------------------------------------
// Cuisine → Places API type mapping
// ---------------------------------------------------------------------------
const CUISINE_TO_TYPE = {
  Japanese: 'japanese_restaurant',
  Italian: 'italian_restaurant',
  Thai: 'thai_restaurant',
  Mexican: 'mexican_restaurant',
  Indian: 'indian_restaurant',
  Chinese: 'chinese_restaurant',
  American: 'american_restaurant',
  Burgers: 'hamburger_restaurant',
  Korean: 'korean_restaurant',
  Mediterranean: 'mediterranean_restaurant',
  Seafood: 'seafood_restaurant',
  Pizza: 'pizza_restaurant',
  Brunch: 'brunch_restaurant',
  Vegan: 'vegan_restaurant',
  BBQ: 'barbecue_restaurant',
  Sushi: 'sushi_restaurant',
  Steak: 'steak_house',
  Ramen: 'ramen_restaurant',
  Dessert: 'dessert_restaurant',
};

// ---------------------------------------------------------------------------
// Fetch, shape, and filter restaurants — returns the processed array.
// This is a pure utility function; the store that calls it owns the state.
// ---------------------------------------------------------------------------
export async function fetchAndShapeRestaurants(filters = {}, location) {
  if (!location) {
    throw new Error('A location (room location) is required to fetch restaurants.');
  }

  const radiusMeters = (filters.distance ?? 5) * 1000;

  let includedPrimaryTypes = (filters.cuisines ?? [])
    .map((c) => CUISINE_TO_TYPE[c] || 'restaurant');
  if (includedPrimaryTypes.length === 0) includedPrimaryTypes = ['restaurant', 'cafe', 'coffee_shop', 'fast_food_restaurant', 'bakery'];

  const result = await fetchRestaurantsNearby(location, radiusMeters, {
    includedPrimaryTypes,
    maxResultCount: 20,
  });

  // --- Shape raw places into view-ready objects ---
  let places = (result.places || []).map(shapeRestaurant);

  // --- Output filtering (business logic) ---
  if (filters.minRating > 0) {
    places = places.filter(
      (p) => p.rating != null && parseFloat(p.rating) >= filters.minRating
    );
  }

  if (filters.priceLevels?.length > 0) {
    places = places.filter((p) => {
      // Unknown price → exclude when user has picked specific levels
      if (p._priceLevel === null) return false;
      // Match any of the selected price levels
      return filters.priceLevels.includes(p._priceLevel);
    });
  }

  return places;
}