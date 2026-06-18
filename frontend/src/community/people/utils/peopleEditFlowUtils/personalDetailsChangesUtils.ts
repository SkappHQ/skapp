import {
  L2PersonalDetailsType,
  L3ContactDetailsType,
  L3EducationalDetailsType,
  L3FamilyDetailsType,
  L3GeneralDetailsType,
  L3HealthAndOtherDetailsType,
  L3SocialMediaDetailsType
} from "~community/people/types/PeopleTypes";

export const isFieldDifferentAndValid = (
  newValue: string | undefined | null | number | boolean,
  oldValue: string | undefined | null | number | boolean
): boolean => {
  if (
    (newValue === undefined || newValue === null || newValue === "") &&
    (oldValue === undefined || oldValue === null || oldValue === "")
  ) {
    return false;
  } else if (newValue !== oldValue) {
    return true;
  } else {
    return false;
  }
};

export const getGeneralDetailsChanges = (
  newGeneral: L3GeneralDetailsType,
  previousGeneral: L3GeneralDetailsType
): Partial<L3GeneralDetailsType> => {
  const changes: Partial<L3GeneralDetailsType> = {};

  if (
    isFieldDifferentAndValid(newGeneral?.title, previousGeneral?.title)
  ) {
    changes.title = newGeneral?.title;
  }

  if (
    isFieldDifferentAndValid(newGeneral?.firstName, previousGeneral?.firstName)
  ) {
    changes.firstName = newGeneral?.firstName;
  }

  if (
    isFieldDifferentAndValid(newGeneral?.lastName, previousGeneral?.lastName)
  ) {
    changes.lastName = newGeneral?.lastName;
  }

  if (
    isFieldDifferentAndValid(
      newGeneral?.middleName,
      previousGeneral?.middleName
    )
  ) {
    changes.middleName = newGeneral?.middleName;
  }

  if (
    isFieldDifferentAndValid(
      newGeneral?.dateOfBirth,
      previousGeneral?.dateOfBirth
    )
  ) {
    changes.dateOfBirth = newGeneral?.dateOfBirth;
  }

  if (isFieldDifferentAndValid(newGeneral?.gender, previousGeneral?.gender)) {
    changes.gender = newGeneral?.gender;
  }

  if (
    isFieldDifferentAndValid(
      newGeneral?.nationality,
      previousGeneral?.nationality
    )
  ) {
    changes.nationality = newGeneral?.nationality;
  }

  if (isFieldDifferentAndValid(newGeneral?.nin, previousGeneral?.nin)) {
    changes.nin = newGeneral?.nin;
  }

  if (
    isFieldDifferentAndValid(
      newGeneral?.passportNumber,
      previousGeneral?.passportNumber
    )
  ) {
    changes.passportNumber = newGeneral?.passportNumber;
  }

  if (
    isFieldDifferentAndValid(
      newGeneral?.maritalStatus,
      previousGeneral?.maritalStatus
    )
  ) {
    changes.maritalStatus = newGeneral?.maritalStatus;
  }

  return changes;
};

export const getContactDetailsChanges = (
  newContact: L3ContactDetailsType,
  previousContact: L3ContactDetailsType
): Partial<L3ContactDetailsType> => {
  const changes: Partial<L3ContactDetailsType> = {};

  if (
    isFieldDifferentAndValid(
      newContact?.personalEmail,
      previousContact?.personalEmail
    )
  ) {
    changes.personalEmail = newContact?.personalEmail;
  }

  if (
    isFieldDifferentAndValid(newContact?.contactNo, previousContact?.contactNo)
  ) {
    changes.contactNo = newContact?.contactNo;
  }

  if (
    isFieldDifferentAndValid(
      newContact?.countryCode,
      previousContact?.countryCode
    )
  ) {
    changes.countryCode = newContact?.countryCode;
  }

  if (
    isFieldDifferentAndValid(
      newContact?.addressLine1,
      previousContact?.addressLine1
    )
  ) {
    changes.addressLine1 = newContact?.addressLine1;
  }

  if (
    isFieldDifferentAndValid(
      newContact?.addressLine2,
      previousContact?.addressLine2
    )
  ) {
    changes.addressLine2 = newContact?.addressLine2;
  }

  if (isFieldDifferentAndValid(newContact?.city, previousContact?.city)) {
    changes.city = newContact?.city;
  }

  if (isFieldDifferentAndValid(newContact?.country, previousContact?.country)) {
    changes.country = newContact?.country;
  }

  if (isFieldDifferentAndValid(newContact?.state, previousContact?.state)) {
    changes.state = newContact?.state;
  }

  if (
    isFieldDifferentAndValid(
      newContact?.postalCode,
      previousContact?.postalCode
    )
  ) {
    changes.postalCode = newContact?.postalCode;
  }

  return changes;
};

export const getFamilyDetailsChanges = (
  newFamily: L3FamilyDetailsType[],
  previousFamily: L3FamilyDetailsType[]
): L3FamilyDetailsType[] => {
  if (newFamily === null || newFamily === undefined) return [];
  // If the array lengths differ, return the entire new family
  if (newFamily.length !== previousFamily.length) {
    return newFamily;
  }

  // Create a map of previous family members by ID for quick lookup
  const previousFamilyMap = previousFamily.reduce(
    (map, member) => {
      if (member.familyId !== undefined) {
        map[member.familyId] = member;
      }
      return map;
    },
    {} as Record<number, L3FamilyDetailsType>
  );

  // Check each new family member for changes
  for (const newMember of newFamily) {
    if (newMember.familyId === undefined) continue;

    const previousMember = previousFamilyMap[newMember.familyId];
    if (!previousMember) continue;

    // Check each field for changes
    if (
      isFieldDifferentAndValid(newMember.firstName, previousMember.firstName) ||
      isFieldDifferentAndValid(newMember.lastName, previousMember.lastName) ||
      isFieldDifferentAndValid(
        newMember.relationship,
        previousMember.relationship
      ) ||
      isFieldDifferentAndValid(newMember.gender, previousMember.gender) ||
      isFieldDifferentAndValid(
        newMember.parentName,
        previousMember.parentName
      ) ||
      isFieldDifferentAndValid(
        newMember.dateOfBirth,
        previousMember.dateOfBirth
      )
    ) {
      return newFamily;
    }
  }
  return [];
};

export const getEducationalDetailsChanges = (
  newEducational: L3EducationalDetailsType[],
  previousEducational: L3EducationalDetailsType[]
): L3EducationalDetailsType[] => {
  if (newEducational === null || previousEducational === undefined) return [];
  // If the array lengths differ, return the entire new educational array
  if (newEducational.length !== previousEducational.length) {
    return newEducational;
  }

  // Create a map of previous education entries by ID for quick lookup
  const previousEducationalMap = previousEducational.reduce(
    (map, education) => {
      if (education.educationId !== undefined) {
        map[education.educationId] = education;
      }
      return map;
    },
    {} as Record<number, L3EducationalDetailsType>
  );

  // Check each new education entry for changes
  for (const newEducation of newEducational) {
    if (newEducation.educationId === undefined) continue;

    const previousEducation = previousEducationalMap[newEducation.educationId];
    if (!previousEducation) continue;

    // Check each field for changes
    if (
      isFieldDifferentAndValid(
        newEducation.institutionName,
        previousEducation.institutionName
      ) ||
      isFieldDifferentAndValid(newEducation.degree, previousEducation.degree) ||
      isFieldDifferentAndValid(newEducation.major, previousEducation.major) ||
      isFieldDifferentAndValid(
        newEducation.startDate,
        previousEducation.startDate
      ) ||
      isFieldDifferentAndValid(newEducation.endDate, previousEducation.endDate)
    ) {
      return newEducational;
    }
  }

  return [];
};

export const getSocialMediaDetailsChanges = (
  newSocialMedia: L3SocialMediaDetailsType,
  previousSocialMedia: L3SocialMediaDetailsType
): L3SocialMediaDetailsType => {
  const changes: L3SocialMediaDetailsType = {};

  if (
    isFieldDifferentAndValid(
      newSocialMedia?.linkedIn,
      previousSocialMedia?.linkedIn
    )
  ) {
    changes.linkedIn = newSocialMedia?.linkedIn;
  }

  if (
    isFieldDifferentAndValid(
      newSocialMedia?.facebook,
      previousSocialMedia?.facebook
    )
  ) {
    changes.facebook = newSocialMedia?.facebook;
  }

  if (
    isFieldDifferentAndValid(
      newSocialMedia?.instagram,
      previousSocialMedia?.instagram
    )
  ) {
    changes.instagram = newSocialMedia?.instagram;
  }

  if (isFieldDifferentAndValid(newSocialMedia?.x, previousSocialMedia?.x)) {
    changes.x = newSocialMedia?.x;
  }

  return changes;
};

export const getHealthAndOtherDetailsChanges = (
  newHealthAndOther: L3HealthAndOtherDetailsType,
  previousHealthAndOther: L3HealthAndOtherDetailsType
): L3HealthAndOtherDetailsType => {
  const changes: L3HealthAndOtherDetailsType = {};

  if (
    isFieldDifferentAndValid(
      newHealthAndOther?.bloodGroup,
      previousHealthAndOther?.bloodGroup
    )
  ) {
    changes.bloodGroup = newHealthAndOther?.bloodGroup;
  }

  if (
    isFieldDifferentAndValid(
      newHealthAndOther?.allergies,
      previousHealthAndOther?.allergies
    )
  ) {
    changes.allergies = newHealthAndOther?.allergies;
  }

  if (
    isFieldDifferentAndValid(
      newHealthAndOther?.dietaryRestrictions,
      previousHealthAndOther?.dietaryRestrictions
    )
  ) {
    changes.dietaryRestrictions = newHealthAndOther?.dietaryRestrictions;
  }

  if (
    isFieldDifferentAndValid(
      newHealthAndOther?.tShirtSize,
      previousHealthAndOther?.tShirtSize
    )
  ) {
    changes.tShirtSize = newHealthAndOther?.tShirtSize;
  }

  return changes;
};

export const getPersonalDetailsChanges = (
  newPersonalDetails: L2PersonalDetailsType,
  previousPersonalDetails: L2PersonalDetailsType
): L2PersonalDetailsType => {
  const changes: L2PersonalDetailsType = {};

  // General Details
  const generalChanges = getGeneralDetailsChanges(
    newPersonalDetails.general as L3GeneralDetailsType,
    previousPersonalDetails.general as L3GeneralDetailsType
  );

  if (Object.keys(generalChanges).length > 0)
    Object.assign(changes, { general: generalChanges });
  else Object.assign(changes, generalChanges);

  // Contact Details
  const contactChanges = getContactDetailsChanges(
    newPersonalDetails.contact as L3ContactDetailsType,
    previousPersonalDetails.contact as L3ContactDetailsType
  );

  if (Object.keys(contactChanges).length > 0)
    Object.assign(changes, { contact: contactChanges });
  else Object.assign(changes, contactChanges);

  // Family Details
  const familyChanges = getFamilyDetailsChanges(
    newPersonalDetails.family as L3FamilyDetailsType[],
    previousPersonalDetails.family as L3FamilyDetailsType[]
  );

  if (Object.keys(familyChanges).length > 0)
    Object.assign(changes, { family: familyChanges });
  else if (
    previousPersonalDetails.family?.length !== 0 &&
    newPersonalDetails.family?.length === 0
  )
    Object.assign(changes, { family: familyChanges });
  else Object.assign(changes, familyChanges);

  // Educational Details
  const educationalChanges = getEducationalDetailsChanges(
    newPersonalDetails.educational as L3EducationalDetailsType[],
    previousPersonalDetails.educational as L3EducationalDetailsType[]
  );

  if (Object.keys(educationalChanges).length > 0)
    Object.assign(changes, { educational: educationalChanges });
  else if (
    previousPersonalDetails.educational?.length !== 0 &&
    newPersonalDetails.educational?.length === 0
  )
    Object.assign(changes, { educational: educationalChanges });
  else Object.assign(changes, educationalChanges);

  // Social Media Details
  const socialMediaChanges = getSocialMediaDetailsChanges(
    newPersonalDetails.socialMedia as L3SocialMediaDetailsType,
    previousPersonalDetails.socialMedia as L3SocialMediaDetailsType
  );

  if (Object.keys(socialMediaChanges).length > 0)
    Object.assign(changes, { socialMedia: socialMediaChanges });
  else Object.assign(changes, socialMediaChanges);

  // Health and Other Details
  const healthAndOtherChanges = getHealthAndOtherDetailsChanges(
    newPersonalDetails.healthAndOther as L3HealthAndOtherDetailsType,
    previousPersonalDetails.healthAndOther as L3HealthAndOtherDetailsType
  );

  if (Object.keys(healthAndOtherChanges).length > 0)
    Object.assign(changes, { healthAndOther: healthAndOtherChanges });
  else Object.assign(changes, healthAndOtherChanges);

  return changes;
};
