export interface GeofenceType {
  id: number;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export interface WorkLocationType {
  workLocationId: number;
  name: string;
  address: string;
  geofence: GeofenceType;
}
