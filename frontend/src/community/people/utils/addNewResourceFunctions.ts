import {
  EmployeeContactDetailsTypes,
  EmployeeEmergencyDetailsTypes,
  EmployeeEmploymentDetailsFormTypes,
  EmployeeEmploymentDetailsTypes,
  EmployeeGeneralDetailsTypes,
  ManagerRemoveType,
  ManagerSearchType,
  ManagerSelectType,
  ManagerStoreType
} from "~community/people/types/AddNewResourceTypes";

import { EditAllInformationType } from "../types/EditEmployeeInfoTypes";

export const handleManagerSelect = async ({
  user,
  fieldName,
  formik,
  searchTermSetter,
  setSupervisor,
  setIsPopperOpen
}: ManagerSelectType): Promise<void> => {
  searchTermSetter("");
  formik.setFieldError(fieldName, "");
  await formik.setFieldValue(fieldName, user?.employeeId);
  setSupervisor(fieldName, {
    employeeId: user?.employeeId?.toString(),
    firstName: user?.firstName,
    lastName: user?.lastName,
    avatarUrl: user?.avatarUrl ?? ""
  });
  setIsPopperOpen(false);
};

export const onManagerSearchChange = async ({
  managerType,
  e,
  setManagerSearchTerm,
  formik,
  setSupervisor
}: ManagerSearchType): Promise<void> => {
  setManagerSearchTerm(e.target.value.trimStart());
  await formik.setFieldValue(managerType, "");
  setSupervisor(managerType, {
    employeeId: "",
    firstName: "",
    lastName: "",
    avatarUrl: ""
  });
};

export const onManagerRemove = async ({
  fieldName,
  formik,
  searchTermSetter,
  setSupervisor
}: ManagerRemoveType): Promise<void> => {
  searchTermSetter("");
  await formik.setFieldValue(fieldName, "");
  const prevManger =
    formik.initialValues[fieldName as keyof EmployeeEmploymentDetailsFormTypes];
  setSupervisor(fieldName, {
    employeeId: (prevManger as ManagerStoreType)?.employeeId ? -1 : "",
    firstName: "",
    lastName: "",
    avatarUrl: ""
  });
};

export const superAdminRedirectSteps = (
  employeeGeneralDetails: EmployeeGeneralDetailsTypes,
  employeeContactDetails: EmployeeContactDetailsTypes,
  employeeEmergencyContactDetails: EmployeeEmergencyDetailsTypes,
  employeeEmploymentDetails: EmployeeEmploymentDetailsTypes
) => {
  if (
    !employeeGeneralDetails?.firstName ||
    !employeeGeneralDetails?.lastName ||
    !employeeGeneralDetails?.gender ||
    !employeeGeneralDetails?.birthDate ||
    !employeeGeneralDetails?.nationality ||
    !employeeGeneralDetails?.maritalStatus ||
    !employeeContactDetails?.personalEmail ||
    !employeeContactDetails?.countryCode ||
    !employeeContactDetails?.phone ||
    !employeeContactDetails?.addressLine1 ||
    !employeeContactDetails?.city ||
    !employeeContactDetails?.country ||
    !employeeContactDetails?.state
  ) {
    return EditAllInformationType.personal;
  } else if (
    !employeeEmergencyContactDetails?.primaryEmergencyContact?.name ||
    !employeeEmergencyContactDetails?.primaryEmergencyContact?.relationship ||
    !employeeEmergencyContactDetails?.primaryEmergencyContact?.countryCode ||
    !employeeEmergencyContactDetails?.primaryEmergencyContact?.phone
  ) {
    return EditAllInformationType.emergency;
  } else if (
    !employeeEmploymentDetails?.employeeNumber ||
    !employeeEmploymentDetails?.workEmail ||
    !employeeEmploymentDetails?.employmentAllocation ||
    !employeeEmploymentDetails?.joinedDate ||
    !employeeEmploymentDetails?.workTimeZone
  ) {
    return EditAllInformationType.employment;
  }
  return null;
};
