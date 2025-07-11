export const STORAGE_KEYS = {
  USER_ID: 'userId',
  GOOGLE_ACCESS_TOKEN: 'googleAccessToken',
  GOOGLE_ID_TOKEN: 'googleIdToken',
};

export const API_STATUS = {
  SUCCESS: 201,
  CONFLICT: 409, 
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
  NETWORK_ERROR: 'NETWORK_ERROR'
} as const;

export const NAVIGATION_ROUTES = {
  TRAVEL_STYLE: 'TravelStyle',
  FIND_TRIPS: 'FindTrips',
};