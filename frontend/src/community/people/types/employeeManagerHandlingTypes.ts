import { FormikProps } from "formik";

import { EmployeeDataType } from "./EmployeeTypes";
import {
  L2EmploymentFormDetailsType,
  L3EmploymentDetailsType
} from "./PeopleTypes";

export interface ManagerSelectType {
  user: EmployeeDataType;
  fieldName: string;
  formik: FormikProps<L3EmploymentDetailsType>;
  searchTermSetter: (term: string) => void;
  setSupervisor: (value: L2EmploymentFormDetailsType) => void;
  setIsPopperOpen: (isOpen: boolean) => void;
}

export interface ManagerSearchType {
  managerType: string;
  searchTerm: string;
  setManagerSearchTerm: (searchTerm: string) => void;
  formik: FormikProps<L3EmploymentDetailsType>;
  setSupervisor: (value: L2EmploymentFormDetailsType) => void;
  isProTier: boolean;
}

export interface ManagerRemoveType {
  fieldName: string;
  formik: FormikProps<L3EmploymentDetailsType>;
  searchTermSetter: (term: string) => void;
  setSupervisor: (value: L2EmploymentFormDetailsType) => void;
}
