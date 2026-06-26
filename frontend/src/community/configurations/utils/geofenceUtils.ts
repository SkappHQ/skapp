export const formatRadius = (meters: number): string => `${meters}m`;

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
