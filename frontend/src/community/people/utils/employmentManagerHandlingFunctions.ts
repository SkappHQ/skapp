import {
  ManagerRemoveType,
  ManagerSearchType,
  ManagerSelectType
} from "../types/employeeManagerHandlingTypes";

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
  const currentEmploymentDetails = formik.values || {};

  if (fieldName === "otherSupervisors") {
    setSupervisor({
      employmentDetails: {
        ...currentEmploymentDetails,
        otherSupervisors: [
          ...(Array.isArray(currentEmploymentDetails?.otherSupervisors)
            ? currentEmploymentDetails.otherSupervisors
            : []),
          {
            employeeId: user?.employeeId,
            firstName: user?.firstName,
            lastName: user?.lastName,
            authPic: user?.avatarUrl ?? ""
          }
        ]
      }
    });
  } else {
    setSupervisor({
      employmentDetails: {
        ...currentEmploymentDetails,
        [fieldName]: {
          employeeId: user?.employeeId,
          firstName: user?.firstName,
          lastName: user?.lastName,
          authPic: user?.avatarUrl ?? ""
        }
      }
    });
  }

  setIsPopperOpen(false);
};
export const onManagerSearchChange = async ({
  managerType,
  searchTerm,
  setManagerSearchTerm,
  formik,
  setSupervisor,
  isProTier
}: ManagerSearchType): Promise<void> => {
  setManagerSearchTerm(searchTerm);
  await formik.setFieldValue(managerType, {});
  const currentEmploymentDetails = formik.values || {};

  if (!(isProTier && managerType === "otherSupervisors")) {
    setSupervisor({
      employmentDetails: {
        ...currentEmploymentDetails,
        [managerType]: managerType === "otherSupervisors" ? [] : {}
      }
    });
  }
};

export const onManagerRemove = async ({
  fieldName,
  formik,
  searchTermSetter,
  setSupervisor
}: ManagerRemoveType): Promise<void> => {
  searchTermSetter("");
  await formik.setFieldValue(fieldName, {});

  const currentEmploymentDetails = formik.values || {};

  setSupervisor({
    employmentDetails: {
      ...currentEmploymentDetails,
      [fieldName]: fieldName === "otherSupervisors" ? [] : {}
    }
  });
};
