export interface BusinessUnit {
  businessUnitId: number;
  name: string;
  description?: string;
}

export interface BusinessUnitRequestPayload {
  name: string;
  description?: string;
}

export interface BusinessUnitUpdateVariables {
  id: number;
  payload: BusinessUnitRequestPayload;
}

export interface BusinessUnitSummary {
  assignedEmployeeCount: number;
  isOtherBusinessUnitsExist: boolean;
}

export interface BusinessUnitDeleteVariables {
  id: number;
  transferToBusinessUnitId?: number;
}

export interface BusinessUnitFormValues {
  name: string;
  description: string;
}
