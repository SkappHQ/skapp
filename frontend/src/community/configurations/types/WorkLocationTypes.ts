export interface WorkLocationGeofence {
  id: number;
  latitude: string;
  longitude: string;
  radiusMeters: number;
}

export interface WorkLocationEmployee {
  employeeId: number;
  firstName: string;
  lastName: string | null;
  authPic: string | null;
}

export interface WorkLocation {
  workLocationId: number;
  name: string;
  address: string | null;
  employeeCount: number;
  isAllEmployees?: boolean;
  employees?: WorkLocationEmployee[];
  geofence?: WorkLocationGeofence | null;
}

export interface WorkLocationGeofenceFormValues {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address: string;
}

export interface WorkLocationFormValues {
  name: string;
  isAllEmployees: boolean;
  employeeIds: number[];
  geofence: WorkLocationGeofenceFormValues | null;
}

/** Shape sent to the backend — address is top-level, geofence has no address field. */
export interface WorkLocationGeofencePayload {
  latitude: string;
  longitude: string;
  radiusMeters: number;
}

export interface WorkLocationRequestPayload {
  name: string;
  address: string;
  isAllEmployees: boolean;
  employeeIds: number[];
  geofence?: WorkLocationGeofencePayload | null;
}

export interface WorkLocationsPage {
  items: WorkLocation[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface WorkLocationNameAvailabilityResponse {
  isExists: boolean;
}
