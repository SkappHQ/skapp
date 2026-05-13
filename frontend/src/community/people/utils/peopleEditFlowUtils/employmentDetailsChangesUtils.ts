import {
  L2EmploymentFormDetailsType,
  L3CareerProgressionDetailsType,
  L3EmploymentDetailsType,
  L3IdentificationAndDiversityDetailsType,
  L3PreviousEmploymentDetailsType,
  L3VisaDetailsType
} from "~community/people/types/PeopleTypes";

import { isFieldDifferentAndValid } from "./personalDetailsChangesUtils";

export const isArrayFieldDifferentAndValid = (
  newArray: number[] | undefined,
  previousArray: number[] | undefined
): boolean => {
  // Check if both arrays are empty or undefined
  if (
    (newArray === undefined || newArray === null || newArray?.length === 0) &&
    (previousArray === undefined ||
      previousArray === null ||
      previousArray?.length === 0)
  ) {
    return false;
  } else if (!newArray || !previousArray) {
    // One is defined and the other isn't
    return true;
  } else if (newArray.length !== previousArray.length) {
    // Arrays have different lengths
    return true;
  } else {
    // Check if any element in newArray is not in previousArray
    return (
      newArray.some((item) => !previousArray.includes(item)) ||
      previousArray.some((item) => !newArray.includes(item))
    );
  }
};

export const getEmploymentChanges = (
  newEmployment: L3EmploymentDetailsType,
  previousEmployement: L3EmploymentDetailsType
): L3EmploymentDetailsType => {
  const changes: L3EmploymentDetailsType = {};

  if (
    isFieldDifferentAndValid(
      newEmployment?.employeeNumber,
      previousEmployement?.employeeNumber
    )
  ) {
    changes.employeeNumber = newEmployment?.employeeNumber;
  }

  if (
    isFieldDifferentAndValid(newEmployment?.email, previousEmployement?.email)
  ) {
    changes.email = newEmployment?.email;
  }

  if (
    isFieldDifferentAndValid(
      newEmployment?.employmentAllocation,
      previousEmployement?.employmentAllocation
    )
  ) {
    changes.employmentAllocation = newEmployment?.employmentAllocation;
  }

  if (
    isArrayFieldDifferentAndValid(
      newEmployment?.teamIds,
      previousEmployement?.teamIds
    )
  ) {
    changes.teamIds = newEmployment?.teamIds;
  }

  if (
    isFieldDifferentAndValid(
      newEmployment?.primarySupervisor?.employeeId?.toString(),
      previousEmployement?.primarySupervisor?.employeeId?.toString()
    )
  ) {
    changes.primarySupervisor = newEmployment?.primarySupervisor;
  }

  const previousOtherSupervisorIds =
    previousEmployement?.otherSupervisors
      ?.map((supervisor) => supervisor.employeeId)
      .filter((id): id is number => id !== undefined) ?? [];
  const newOtherSupervisorIds =
    newEmployment?.otherSupervisors
      ?.map((supervisor) => supervisor.employeeId)
      .filter((id): id is number => id !== undefined) ?? [];

  if (
    isArrayFieldDifferentAndValid(
      newOtherSupervisorIds,
      previousOtherSupervisorIds
    )
  ) {
    changes.otherSupervisors = newEmployment?.otherSupervisors;
  }

  if (
    isFieldDifferentAndValid(
      newEmployment?.joinedDate,
      previousEmployement?.joinedDate
    )
  ) {
    changes.joinedDate = newEmployment?.joinedDate;
  }

  if (
    isFieldDifferentAndValid(
      newEmployment?.probationStartDate,
      previousEmployement?.probationStartDate
    )
  ) {
    changes.probationStartDate = newEmployment?.probationStartDate;
  }

  if (
    isFieldDifferentAndValid(
      newEmployment?.probationEndDate,
      previousEmployement?.probationEndDate
    )
  ) {
    changes.probationEndDate = newEmployment?.probationEndDate;
  }

  if (
    isFieldDifferentAndValid(
      newEmployment?.workTimeZone,
      previousEmployement?.workTimeZone
    )
  ) {
    changes.workTimeZone = newEmployment?.workTimeZone;
  }

  if (
    isFieldDifferentAndValid(
      newEmployment?.workLocationId,
      previousEmployement?.workLocationId
    )
  ) {
    changes.workLocationId = newEmployment?.workLocationId;
  }

  return changes;
};

export const getCareerProgressionChanges = (
  newCareer: L3CareerProgressionDetailsType[],
  previousCareer: L3CareerProgressionDetailsType[]
): L3CareerProgressionDetailsType[] => {
  if (newCareer === null || previousCareer === undefined) return [];

  // If the array lengths differ, return the entire new career array
  if (newCareer.length !== previousCareer.length) {
    return newCareer;
  }

  // Create a map of previous career items by ID for quick lookup
  const previousCareerMap = previousCareer.reduce(
    (map, item) => {
      if (item.progressionId !== undefined) {
        map[item.progressionId] = item;
      }
      return map;
    },
    {} as Record<number, L3CareerProgressionDetailsType>
  );

  // Check each new career item for changes
  for (const newItem of newCareer) {
    if (newItem.progressionId === undefined) continue;

    const previousItem = previousCareerMap[newItem.progressionId];
    if (!previousItem) continue;

    // Check each field for changes
    if (
      isFieldDifferentAndValid(
        newItem.employmentType,
        previousItem.employmentType
      ) ||
      isFieldDifferentAndValid(newItem.jobFamilyId, previousItem.jobFamilyId) ||
      isFieldDifferentAndValid(newItem.jobTitleId, previousItem.jobTitleId) ||
      isFieldDifferentAndValid(newItem.startDate, previousItem.startDate) ||
      isFieldDifferentAndValid(newItem.endDate, previousItem.endDate) ||
      isFieldDifferentAndValid(
        newItem.isCurrentEmployment,
        previousItem.isCurrentEmployment
      )
    ) {
      return newCareer;
    }
  }
  return [];
};

export const getIdentificationDetailsChanges = (
  newIdentificationDetails: L3IdentificationAndDiversityDetailsType,
  previousIdentificationDetails: L3IdentificationAndDiversityDetailsType
): L3IdentificationAndDiversityDetailsType => {
  const changes: L3IdentificationAndDiversityDetailsType = {};

  if (
    newIdentificationDetails === null ||
    previousIdentificationDetails === null
  )
    return changes;

  if (
    isFieldDifferentAndValid(
      newIdentificationDetails.ssn,
      previousIdentificationDetails.ssn
    )
  ) {
    changes.ssn = newIdentificationDetails.ssn;
  }

  if (
    isFieldDifferentAndValid(
      newIdentificationDetails.ethnicity,
      previousIdentificationDetails.ethnicity
    )
  ) {
    changes.ethnicity = newIdentificationDetails.ethnicity;
  }

  if (
    isFieldDifferentAndValid(
      newIdentificationDetails.eeoJobCategory,
      previousIdentificationDetails.eeoJobCategory
    )
  ) {
    changes.eeoJobCategory = newIdentificationDetails.eeoJobCategory;
  }

  return changes;
};

export const getPreviousEmploymentChanges = (
  newEmployments: L3PreviousEmploymentDetailsType[],
  previousEmployments: L3PreviousEmploymentDetailsType[]
): L3PreviousEmploymentDetailsType[] => {
  if (newEmployments === null || previousEmployments === null) return [];
  // If the array lengths differ, return the entire new array
  if (newEmployments.length !== previousEmployments.length) {
    return newEmployments;
  }
  // Create a map of previous employments by ID for quick lookup
  const previousEmploymentMap = previousEmployments.reduce(
    (map, employment) => {
      if (employment.employmentId !== undefined) {
        map[employment.employmentId] = employment;
      }
      return map;
    },
    {} as Record<number, L3PreviousEmploymentDetailsType>
  );

  // Check each new employment for changes
  for (const newEmployment of newEmployments) {
    if (newEmployment.employmentId === undefined) continue;

    const previousEmployment =
      previousEmploymentMap[newEmployment.employmentId];

    if (!previousEmployment) continue;

    if (
      isFieldDifferentAndValid(
        newEmployment.companyName,
        previousEmployment.companyName
      ) ||
      isFieldDifferentAndValid(
        newEmployment.jobTitle,
        previousEmployment.jobTitle
      ) ||
      isFieldDifferentAndValid(
        newEmployment.startDate,
        previousEmployment.startDate
      ) ||
      isFieldDifferentAndValid(
        newEmployment.endDate,
        previousEmployment.endDate
      )
    ) {
      return newEmployments;
    }
  }

  return [];
};

export const getVisaDetailsChanges = (
  newVisas: L3VisaDetailsType[],
  previousVisas: L3VisaDetailsType[]
): L3VisaDetailsType[] => {
  if (newVisas === null || previousVisas === null) return [];

  if (newVisas.length !== previousVisas.length) {
    return newVisas;
  }

  const previousVisaMap = previousVisas.reduce(
    (map, visa) => {
      if (visa.visaId !== undefined) {
        map[visa.visaId] = visa;
      }
      return map;
    },
    {} as Record<number, L3VisaDetailsType>
  );

  for (const newVisa of newVisas) {
    if (newVisa.visaId === undefined) continue;

    const previousVisa = previousVisaMap[newVisa.visaId];
    if (!previousVisa) continue;

    if (
      isFieldDifferentAndValid(newVisa.visaType, previousVisa.visaType) ||
      isFieldDifferentAndValid(
        newVisa.issuingCountry,
        previousVisa.issuingCountry
      ) ||
      isFieldDifferentAndValid(newVisa.issuedDate, previousVisa.issuedDate) ||
      isFieldDifferentAndValid(newVisa.expiryDate, previousVisa.expiryDate)
    ) {
      return newVisas;
    }
  }

  return [];
};

export const getEmploymentDetailsChanges = (
  newEmployementDetails: L2EmploymentFormDetailsType,
  previousEmployementDetails: L2EmploymentFormDetailsType
): L2EmploymentFormDetailsType => {
  const changes: L2EmploymentFormDetailsType = {};

  const employmentChanges = getEmploymentChanges(
    newEmployementDetails.employmentDetails as L3EmploymentDetailsType,
    previousEmployementDetails.employmentDetails as L3EmploymentDetailsType
  );
  if (Object.keys(employmentChanges).length > 0)
    Object.assign(changes, { employmentDetails: employmentChanges });
  else Object.assign(changes, employmentChanges);

  const careerProgressionChanges = getCareerProgressionChanges(
    newEmployementDetails.careerProgression as L3CareerProgressionDetailsType[],
    previousEmployementDetails.careerProgression as L3CareerProgressionDetailsType[]
  );
  if (careerProgressionChanges.length > 0)
    Object.assign(changes, { careerProgression: careerProgressionChanges });
  else Object.assign(changes, careerProgressionChanges);

  const identificationDetailsChanges = getIdentificationDetailsChanges(
    newEmployementDetails.identificationAndDiversityDetails as L3IdentificationAndDiversityDetailsType,
    previousEmployementDetails.identificationAndDiversityDetails as L3IdentificationAndDiversityDetailsType
  );
  if (Object.keys(identificationDetailsChanges).length > 0)
    Object.assign(changes, {
      identificationAndDiversityDetails: identificationDetailsChanges
    });
  else Object.assign(changes, identificationDetailsChanges);

  const previousEmploymentChanges = getPreviousEmploymentChanges(
    newEmployementDetails.previousEmployment as L3PreviousEmploymentDetailsType[],
    previousEmployementDetails.previousEmployment as L3PreviousEmploymentDetailsType[]
  );
  if (previousEmploymentChanges.length > 0)
    Object.assign(changes, { previousEmployment: previousEmploymentChanges });
  else Object.assign(changes, previousEmploymentChanges);

  const visaDetailsChanges = getVisaDetailsChanges(
    newEmployementDetails.visaDetails as L3VisaDetailsType[],
    previousEmployementDetails.visaDetails as L3VisaDetailsType[]
  );
  if (Object.keys(visaDetailsChanges).length > 0)
    Object.assign(changes, { visaDetails: visaDetailsChanges });
  else if (
    previousEmployementDetails.visaDetails?.length !== 0 &&
    newEmployementDetails.visaDetails?.length === 0
  )
    Object.assign(changes, { visaDetails: visaDetailsChanges });
  else Object.assign(changes, visaDetailsChanges);

  return changes;
};
