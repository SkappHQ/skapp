import {
  L2EmergencyDetailsType,
  L3EmergencyContactType
} from "~community/people/types/PeopleTypes";

import { isFieldDifferentAndValid } from "./personalDetailsChangesUtils";

export const getEmergencyContactChanges = (
  newContact: L3EmergencyContactType,
  previousContact: L3EmergencyContactType
): Record<string, any> => {
  const changes: Record<string, any> = {};

  if (isFieldDifferentAndValid(newContact?.name, previousContact?.name)) {
    changes.name = newContact?.name;
  }
  if (
    isFieldDifferentAndValid(
      newContact?.relationship,
      previousContact?.relationship
    )
  ) {
    changes.relationship = newContact?.relationship;
  }
  if (
    isFieldDifferentAndValid(newContact?.contactNo, previousContact?.contactNo)
  ) {
    changes.contactNo = newContact?.contactNo;
  }

  return changes;
};

export const getEmergencyContactDetailsChanges = (
  newEmergencyDetails: L2EmergencyDetailsType,
  previousEmergencyDetails: L2EmergencyDetailsType
): L2EmergencyDetailsType => {
  const changes: L2EmergencyDetailsType = {};

  const primaryContactChanges = getEmergencyContactChanges(
    newEmergencyDetails.primaryEmergencyContact as L3EmergencyContactType,
    previousEmergencyDetails.primaryEmergencyContact as L3EmergencyContactType
  );

  if (Object.keys(primaryContactChanges).length > 0) {
    changes.primaryEmergencyContact = primaryContactChanges;
  }

  const secondaryContactChanges = getEmergencyContactChanges(
    newEmergencyDetails.secondaryEmergencyContact as L3EmergencyContactType,
    previousEmergencyDetails.secondaryEmergencyContact as L3EmergencyContactType
  );
  if (Object.keys(secondaryContactChanges).length > 0) {
    changes.secondaryEmergencyContact = secondaryContactChanges;
  }

  return changes;
};
