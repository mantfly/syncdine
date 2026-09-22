const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchNearby';
import { checkRateLimit } from '../rateLimiter';


//gets the user's current location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator?.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(error.message || 'Failed to get location'));
      }
    );
  });
};

/**
 * Fetches restaurants nearby using Google Places API (New) searchNearby.
 * @param {{latitude: number, longitude: number}} location
 * @param {number} radius - Radius in meters (0-50000)
 * @param {Object} [preferences] - Optional: maxResultCount, includedTypes, etc.
 * @returns {Promise<{places: Array}>}
 */
export const fetchRestaurantsNearby = async (location, radius, preferences = {}) => {

  //can do a maximum of 50K calls per day.
  checkRateLimit('places_api', 50000);

  const apiKey = import.meta.env.VITE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_PLACES_API_KEY is not defined in environment');
  }

  //default preferences. if preferences is provided, it overrides the defaults.
  const {
    maxResultCount = 20,
    includedPrimaryTypes = ['restaurant'],
  } = preferences;

  const response = await fetch(PLACES_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'places.displayName,places.location,places.formattedAddress,places.priceLevel,places.rating,places.types,places.primaryType,places.websiteUri,places.photos,places.regularOpeningHours',
    },
    body: JSON.stringify({
      locationRestriction: {
        circle: {
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          radius,
        },
      },
      includedPrimaryTypes,
      maxResultCount,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Places API error: ${response.status}`);
  }
  else {
    console.log("Restaurants fetched successfully");
    console.log(response);
    console.log("-----");

  }

  return response.json();
};



/*
  Builds a photo URL from a Places API photo resource name. The API (New) returns a `name` like
   "places/ChIJ.../photos/AU_ZVE..."
 To get an actual image you hit the media endpoint:
*/
export function getPlacePhotoUrl(photoName, maxWidthPx = 400) {
  if (!photoName) return null;
  const apiKey = import.meta.env.VITE_PLACES_API_KEY;
  if (!apiKey) return null;
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${apiKey}`;
}


/**
 * Fetches autocomplete suggestions using the new Places API.
 */
export const fetchAddressSuggestions = async (input) => {
  if (!input) return { suggestions: [] };

  checkRateLimit('places_api', 50000);
  const apiKey = import.meta.env.VITE_PLACES_API_KEY;

  const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
    },
    body: JSON.stringify({
      input,
      includedPrimaryTypes: ["street_address", "premise", "route", "neighborhood", "locality"]
    }),
  });

  if (!response.ok) {
    throw new Error('Places API autocomplete error');
  }

  return response.json();
};

/**
 * Fetches specific details (location coordinates) for a place given its ID.
 */
export const fetchPlaceDetails = async (placeId) => {
  checkRateLimit('places_api', 50000);
  const apiKey = import.meta.env.VITE_PLACES_API_KEY;

  const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}?fields=location,formattedAddress,name`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error('Places API details error');
  }

  return response.json();
};

