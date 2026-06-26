import { DEFAULT_COUNTRY_CODE } from "~community/common/constants/configs";
import { usePeopleStore } from "~community/people/store/store";
import { SystemPermissionTypes } from "~community/people/types/AddNewResourceTypes";
import { EmploymentStatusTypes } from "~community/people/types/EmployeeTypes";

interface Props {
  replaceDefaultValuesWithEmptyStrings?: boolean;
}

const useCreateEmployeeObject = ({
  replaceDefaultValuesWithEmptyStrings = true
}: Props) => {
  const {
    employeeGeneralDetails,
    employeeContactDetails,
    employeeFamilyDetails,
    employeeEducationalDetails,
    employeeSocialMediaDetails,
    employeeHealthAndOtherDetails,
    employeeEmergencyContactDetails,
    employeeEmploymentDetails,
    employeeCareerDetails,
    employeeIdentificationAndDiversityDetails,
    employeePreviousEmploymentDetails,
    employeeVisaDetails,
    employeeEntitlementsDetails
  } = usePeopleStore((state) => state);

  const getEmployeeObject = () => ({
    ...employeeGeneralDetails,
    employeeContactDetails: {
      ...employeeContactDetails,
      countryCode:
        replaceDefaultValuesWithEmptyStrings &&
        employeeContactDetails?.countryCode === DEFAULT_COUNTRY_CODE
          ? ""
          : employeeContactDetails?.countryCode
    },
    ...employeeFamilyDetails,
    ...employeeEducationalDetails,
    ...employeeSocialMediaDetails,
    ...employeeHealthAndOtherDetails,
    employeeEmergencyContactDetails: {
      primaryEmergencyContact: {
        ...employeeEmergencyContactDetails?.primaryEmergencyContact,
        countryCode:
          replaceDefaultValuesWithEmptyStrings &&
          employeeEmergencyContactDetails?.primaryEmergencyContact
            ?.countryCode === DEFAULT_COUNTRY_CODE
            ? ""
            : employeeEmergencyContactDetails?.primaryEmergencyContact
                ?.countryCode
      },
      secondaryEmergencyContact: {
        ...employeeEmergencyContactDetails?.secondaryEmergencyContact,
        countryCode:
          replaceDefaultValuesWithEmptyStrings &&
          employeeEmergencyContactDetails?.secondaryEmergencyContact
            ?.countryCode === DEFAULT_COUNTRY_CODE
            ? ""
            : employeeEmergencyContactDetails?.secondaryEmergencyContact
                ?.countryCode
      }
    },
    employeeEmploymentDetails: {
      ...employeeEmploymentDetails,
      employmentStatus:
        replaceDefaultValuesWithEmptyStrings &&
        employeeEmploymentDetails?.employmentStatus ===
          EmploymentStatusTypes.PENDING
          ? ""
          : employeeEmploymentDetails?.employmentStatus,
      systemPermission:
        replaceDefaultValuesWithEmptyStrings &&
        employeeEmploymentDetails?.systemPermission ===
          SystemPermissionTypes.EMPLOYEES
          ? ""
          : employeeEmploymentDetails?.systemPermission
    },
    ...employeeCareerDetails,
    ...employeeIdentificationAndDiversityDetails,
    ...employeePreviousEmploymentDetails,
    ...employeeVisaDetails,
    ...employeeEntitlementsDetails
  });

  return { getEmployeeObject };
};

export default useCreateEmployeeObject;
