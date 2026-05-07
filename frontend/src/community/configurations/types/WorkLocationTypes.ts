export interface WorkLocationGeofence {
  id: number;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address: string;
}

export interface WorkLocationEmployee {
  employeeId: number;
  firstName: string;
  lastName: string;
  authPic: string;
}

export interface WorkLocation {
  workLocationId: number;
  name: string;
  employeeCount: number;
  isAllEmployees: boolean;
  employees: WorkLocationEmployee[];
  geofence: WorkLocationGeofence | null;
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

export interface WorkLocationsPage {
  items: WorkLocation[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}
