import {
  DEGREES_TO_RADIANS,
  EARTH_RADIUS_METERS
} from "~community/configurations/constants/workLocationConstants";

export const formatRadius = (meters: number): string => `${meters}m`;

/**
 * Calculates the distance in meters between two geographic coordinates
 * using the Haversine formula.
 */
export const haversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const toRad = (deg: number) => deg * DEGREES_TO_RADIANS;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_METERS * c);
};

export const forwardGeocode = async (
  address: string
): Promise<{ lat: number; lng: number; formattedAddress: string } | null> => {
  const geocoder = new google.maps.Geocoder();
  const response = await geocoder.geocode({ address });
  const result = response.results[0];
  if (!result) return null;
  return {
    lat: result.geometry.location.lat(),
    lng: result.geometry.location.lng(),
    formattedAddress: result.formatted_address
  };
};

export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<string> => {
  const geocoder = new google.maps.Geocoder();
  const response = await geocoder.geocode({
    location: { lat, lng }
  });
  return response.results[0]?.formatted_address ?? "";
};
