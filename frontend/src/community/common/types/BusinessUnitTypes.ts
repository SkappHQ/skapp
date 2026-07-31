export interface BusinessUnit {
  businessUnitId: number;
  name: string;
  description: string | null;
}

export interface BusinessUnitRequestPayload {
  name: string;
  description: string | null;
}

export interface BusinessUnitUpdateVariables {
  id: number;
  payload: BusinessUnitRequestPayload;
}
