import { RelationshipTypes } from "~community/people/enums/PeopleEnums";
import {
  L2EmergencyDetailsType,
  L3EmergencyContactType
} from "~community/people/types/PeopleTypes";

import {
  getEmergencyContactChanges,
  getEmergencyContactDetailsChanges
} from "./emergencyDetailsChangesUtils";

// Corrected import path

describe("getEmergencyContactChanges", () => {
  it("should return changes for updated fields", () => {
    const newContact: L3EmergencyContactType = {
      name: "John Doe",
      relationship: RelationshipTypes.FAMILY, // Updated to use valid RelationshipTypes
      contactNo: "1234567890"
    };
    const previousContact: L3EmergencyContactType = {
      name: "Jane Doe",
      relationship: RelationshipTypes.FRIEND, // Updated to use valid RelationshipTypes
      contactNo: "0987654321"
    };

    const result = getEmergencyContactChanges(newContact, previousContact);

    expect(result).toEqual({
      name: "John Doe",
      relationship: RelationshipTypes.FAMILY,
      contactNo: "1234567890"
    });
  });

  it("should return an empty object if no fields are updated", () => {
    const contact: L3EmergencyContactType = {
      name: "John Doe",
      relationship: RelationshipTypes.FAMILY, // Updated to use valid RelationshipTypes
      contactNo: "1234567890"
    };

    const result = getEmergencyContactChanges(contact, contact);

    expect(result).toEqual({});
  });
});

describe("getEmergencyContactDetailsChanges", () => {
  it("should return changes for primary and secondary emergency contacts", () => {
    const newEmergencyDetails: L2EmergencyDetailsType = {
      primaryEmergencyContact: {
        name: "John Doe",
        relationship: RelationshipTypes.FAMILY, // Updated to use valid RelationshipTypes
        contactNo: "1234567890"
      },
      secondaryEmergencyContact: {
        name: "Alice Smith",
        relationship: RelationshipTypes.FRIEND, // Updated to use valid RelationshipTypes
        contactNo: "1112223333"
      }
    };
    const previousEmergencyDetails: L2EmergencyDetailsType = {
      primaryEmergencyContact: {
        name: "Jane Doe",
        relationship: RelationshipTypes.FRIEND, // Updated to use valid RelationshipTypes
        contactNo: "0987654321"
      },
      secondaryEmergencyContact: {
        name: "Alice Smith",
        relationship: RelationshipTypes.FRIEND, // Updated to use valid RelationshipTypes
        contactNo: "1112223333"
      }
    };

    const result = getEmergencyContactDetailsChanges(
      newEmergencyDetails,
      previousEmergencyDetails
    );

    expect(result).toEqual({
      primaryEmergencyContact: {
        name: "John Doe",
        relationship: RelationshipTypes.FAMILY,
        contactNo: "1234567890"
      }
    });
  });

  it("should return an empty object if no changes are detected", () => {
    const emergencyDetails: L2EmergencyDetailsType = {
      primaryEmergencyContact: {
        name: "John Doe",
        relationship: RelationshipTypes.FAMILY, // Updated to use valid RelationshipTypes
        contactNo: "1234567890"
      },
      secondaryEmergencyContact: {
        name: "Alice Smith",
        relationship: RelationshipTypes.FRIEND, // Updated to use valid RelationshipTypes
        contactNo: "1112223333"
      }
    };

    const result = getEmergencyContactDetailsChanges(
      emergencyDetails,
      emergencyDetails
    );

    expect(result).toEqual({});
  });

  it("should return changes for secondary emergency contact", () => {
    const newEmergencyDetails: L2EmergencyDetailsType = {
      primaryEmergencyContact: {
        name: "John Doe",
        relationship: RelationshipTypes.FAMILY,
        contactNo: "1234567890"
      },
      secondaryEmergencyContact: {
        name: "Alice Johnson",
        relationship: RelationshipTypes.GUARDIAN, // Updated to use a valid RelationshipTypes value
        contactNo: "4445556666"
      }
    };
    const previousEmergencyDetails: L2EmergencyDetailsType = {
      primaryEmergencyContact: {
        name: "John Doe",
        relationship: RelationshipTypes.FAMILY,
        contactNo: "1234567890"
      },
      secondaryEmergencyContact: {
        name: "Alice Smith",
        relationship: RelationshipTypes.FRIEND,
        contactNo: "1112223333"
      }
    };

    const result = getEmergencyContactDetailsChanges(
      newEmergencyDetails,
      previousEmergencyDetails
    );

    expect(result).toEqual({
      secondaryEmergencyContact: {
        name: "Alice Johnson",
        relationship: RelationshipTypes.GUARDIAN, // Updated to match the new value
        contactNo: "4445556666"
      }
    });
  });
});
