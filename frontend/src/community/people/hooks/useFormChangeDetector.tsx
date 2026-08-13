import { useEffect, useState } from "react";

import { usePeopleStore } from "~community/people/store/store";

import { EditPeopleFormTypes } from "../types/PeopleEditTypes";
import {
  L1EmployeeType,
  L2EmploymentFormDetailsType
} from "../types/PeopleTypes";
import { getEmergencyContactDetailsChanges } from "../utils/peopleEditFlowUtils/emergencyDetailsChangesUtils";
import { getEmploymentDetailsChanges } from "../utils/peopleEditFlowUtils/employmentDetailsChangesUtils";
import { getPersonalDetailsChanges } from "../utils/peopleEditFlowUtils/personalDetailsChangesUtils";
import { getSystemPermissionsDetailsChanges } from "../utils/peopleEditFlowUtils/systemPermissionsChangesUtils";

const useFormChangeDetector = (): {
  hasChanged: boolean;
  apiPayload: L1EmployeeType;
} => {
  const [state, setState] = useState<{
    hasChanged: boolean;
    apiPayload: L1EmployeeType;
  }>({
    hasChanged: false,
    apiPayload: {}
  });

  const { employee, initialEmployee, currentStep } = usePeopleStore(
    (state) => state
  );

  useEffect(() => {
    let newApiPayload: L1EmployeeType = {};

    switch (currentStep) {
      case EditPeopleFormTypes.personal: {
        const newPersonalDetails = employee?.personal;
        const previousPersonalDetails = initialEmployee?.personal;

        if (newPersonalDetails && previousPersonalDetails) {
          newApiPayload = {
            personal: {
              ...getPersonalDetailsChanges(
                newPersonalDetails,
                previousPersonalDetails
              )
            }
          };
        }
        break;
      }
      case EditPeopleFormTypes.employment: {
        const newEmploymentDetails = employee?.employment;
        const previousEmploymentDetails = initialEmployee?.employment;

        newApiPayload = {
          employment: {
            ...getEmploymentDetailsChanges(
              newEmploymentDetails as L2EmploymentFormDetailsType,
              previousEmploymentDetails as L2EmploymentFormDetailsType
            )
          }
        };
        break;
      }
      case EditPeopleFormTypes.permission: {
        const newSystemPermissions = employee?.systemPermissions;
        const previousSystemPermissions = initialEmployee?.systemPermissions;

        if (newSystemPermissions && previousSystemPermissions) {
          newApiPayload = {
            systemPermissions: {
              ...getSystemPermissionsDetailsChanges(
                newSystemPermissions,
                previousSystemPermissions
              )
            }
          };
        }
        break;
      }
      case EditPeopleFormTypes.emergency: {
        const newEmergencyDetails = employee?.emergency;
        const previousEmergencyDetails = initialEmployee?.emergency;

        if (newEmergencyDetails && previousEmergencyDetails) {
          newApiPayload = {
            emergency: {
              ...getEmergencyContactDetailsChanges(
                newEmergencyDetails,
                previousEmergencyDetails
              )
            }
          };
        }
        break;
      }
      default:
        break;
    }
    // Check if the payload contains actual changes (not just empty objects)
    const hasRealChanges = Object.keys(newApiPayload).some((key) => {
      const value = newApiPayload[key as keyof L1EmployeeType];
      return (
        value && typeof value === "object" && Object.keys(value).length > 0
      );
    });

    setState({
      hasChanged: hasRealChanges,
      apiPayload: hasRealChanges ? newApiPayload : {}
    });
  }, [currentStep, employee, initialEmployee]);

  return state;
};

export default useFormChangeDetector;
