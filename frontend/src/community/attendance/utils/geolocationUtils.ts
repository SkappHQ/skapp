interface GeoLocation {
  latitude: number | null;
  longitude: number | null;
}

export const getCurrentLocation = (): Promise<GeoLocation> => {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => {
        resolve({
          latitude: null,
          longitude: null
        });
      }
    );
  });
};
