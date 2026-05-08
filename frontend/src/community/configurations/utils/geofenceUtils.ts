export const MIN_RADIUS = 0;
export const MAX_RADIUS = 300;

export const formatRadius = (meters: number): string => `${meters}m`;

const GEOCODE_BASE = "https://maps.googleapis.com/maps/api/geocode/json";

export const forwardGeocode = async (
  address: string,
  apiKey: string
): Promise<{ lat: number; lng: number; formattedAddress: string } | null> => {
  const resp = await fetch(
    `${GEOCODE_BASE}?address=${encodeURIComponent(address)}&key=${apiKey}`
  );
  const json = await resp.json();
  const result = json?.results?.[0];
  if (!result) return null;
  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address
  };
};

export const reverseGeocode = async (
  lat: number,
  lng: number,
  apiKey: string
): Promise<string> => {
  const resp = await fetch(
    `${GEOCODE_BASE}?latlng=${lat},${lng}&key=${apiKey}`
  );
  const json = await resp.json();
  return json?.results?.[0]?.formatted_address ?? "";
};
