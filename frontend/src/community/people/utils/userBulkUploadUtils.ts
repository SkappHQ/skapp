import { TitleEnum } from "~community/people/enums/PeopleEnums";
import {
  BloodGroupTypes,
  EEOJobCategoryTypes,
  EmploymentAllocationTypes,
  EthnicityTypes
} from "~community/people/types/AddNewResourceTypes";

export const TitleSelector: Record<string, string> = {
  Mr: TitleEnum.MR,
  Mrs: TitleEnum.MRS,
  Miss: TitleEnum.MISS
};

export const BloodGroupSelector: Record<string, string> = {
  "(A+)": BloodGroupTypes.A_POSITIVE,
  "(A-)": BloodGroupTypes.A_NEGATIVE,
  "(B+)": BloodGroupTypes.B_POSITIVE,
  "(B-)": BloodGroupTypes.B_NEGATIVE,
  "(O+)": BloodGroupTypes.O_POSITIVE,
  "(O-)": BloodGroupTypes.O_NEGATIVE,
  "(AB+)": BloodGroupTypes.AB_POSITIVE,
  "(AB-)": BloodGroupTypes.AB_NEGATIVE
};

export const AllocationSelector: Record<string, string> = {
  "Full Time": EmploymentAllocationTypes.FULL_TIME,
  "Part Time": EmploymentAllocationTypes.PART_TIME
};

export const EeoSelector: Record<string, string> = {
  "Executive/senior-level officials and managers":
    EEOJobCategoryTypes.EXECUTIVE,
  "First/mid-level officials and managers": EEOJobCategoryTypes.FIRST_MID_LEVEL,
  Professionals: EEOJobCategoryTypes.PROFESSIONALS,
  Technicians: EEOJobCategoryTypes.TECHNICIANS,
  "Sales Workers": EEOJobCategoryTypes.SALES_WORKERS,
  "Administrative support workers": EEOJobCategoryTypes.SUPPORT_WORKERS,
  "Craft workers": EEOJobCategoryTypes.CRAFT_WORKERS,
  Operatives: EEOJobCategoryTypes.OPERATIVES,
  "Laborers and helpers": EEOJobCategoryTypes.LABORERS,
  "Service workers": EEOJobCategoryTypes.SERVICE_WORKERS
};

export const EthnicitySelector: Record<string, string> = {
  African: EthnicityTypes.AFRICAN,
  Caribbean: EthnicityTypes.CARIBBEAN,
  Indian: EthnicityTypes.INDIAN,
  Melanesian: EthnicityTypes.MELANESIAN,
  "Australasian/Aboriginal": EthnicityTypes.AUSTRALASIAN_OR_ABORIGINAL,
  Chinese: EthnicityTypes.CHINESE,
  Guamanian: EthnicityTypes.GUAMANIAN,
  Japanese: EthnicityTypes.JAPANESE,
  Korean: EthnicityTypes.KOREAN,
  Polynesian: EthnicityTypes.POLYNESIAN,
  "European/Anglo Saxon": EthnicityTypes.EUROPEAN_OR_ANGLO_SAXON,
  "Other Pacific Islander": EthnicityTypes.OTHER_PACIFIC_ISLANDER,
  "Latin American": EthnicityTypes.LATIN_AMERICAN,
  Arabic: EthnicityTypes.ARABIC,
  Vietnamese: EthnicityTypes.VIETNAMESE,
  Micronesian: EthnicityTypes.MICRONESIAN,
  "Declined to Respond": EthnicityTypes.DECLINED_TO_RESPOND,
  "Other Hispanic": EthnicityTypes.OTHER_HISPANIC,
  "US or Canadian Indian": EthnicityTypes.US_OR_CANADIAN_INDIAN,
  "Other Asian": EthnicityTypes.OTHER_ASIAN,
  "Puerto Rican": EthnicityTypes.PUERTO_RICAN,
  Filipino: EthnicityTypes.FILIPINO,
  Mexican: EthnicityTypes.MEXICAN,
  "Alaskan Native": EthnicityTypes.ALASKAN_NATIVE,
  Cuban: EthnicityTypes.CUBAN
};

// TODO: Might be reuseable
export const replaceEmptyStringsWithNull = (obj: any) => {
  const copyOfObject = obj;
  for (const key in copyOfObject) {
    if (typeof copyOfObject[key] === "string" && copyOfObject[key] === "") {
      obj[key] = null;
    } else if (
      typeof copyOfObject[key] === "object" &&
      copyOfObject[key] !== null
    ) {
      replaceEmptyStringsWithNull(copyOfObject[key]);
    }
  }
  return copyOfObject;
};

export const convertUserBulkCsvHeaders = (header: string) => {
  const headerSelector: Record<string, string> = {
    Title: "title",
    "First name*": "firstName",
    "Middle name": "middleName",
    "Last name*": "lastName",
    "Work Email*": "workEmail",
    Gender: "gender",
    Birthdate: "birthDate",
    Nationality: "nationality",
    "NIN (National identification number)": "nin",
    "Marital Status": "maritalStatus",
    "Personal Email": "personalEmail",
    "Contact No Country Code": "phoneDialCode",
    "Contact No": "phone",
    "Address Line 1": "address",
    "Address Line 2": "addressLine2",
    City: "city",
    Country: "country",
    "State / Province": "state",
    "Postal Code": "postalCode",
    LinkedIn: "linkedIn",
    Facebook: "facebook",
    Instagram: "instagram",
    "X(Twitter)": "x",
    "Blood Group": "bloodGroup",
    Allergies: "allergies",
    "Dietary Restrictions": "dietaryRestrictions",
    "T Shirt Size": "tshirtSize",
    "Emergency Contact Name": "name",
    "Emergency Contact Relationship": "emergencyRelationship",
    "Emergency Contact Country Code": "contactNoDialCode",
    "Emergency Contact Number": "contactNo",
    "Emp No": "identificationNo",
    "Employment Allocation": "employmentAllocation",
    "Joined Date": "joinedDate",
    Teams: "teams",
    "Primary Supervisor(Email)": "primaryManager",
    "Probation Start Date": "startDate",
    "Probation End Date": "endDate",
    "Work Time Zone": "timeZone",
    "Work Location": "workLocation",
    "Employment Type": "employeeType",
    "Job Family": "jobFamilyId",
    "Job Title": "jobTitleId",
    "Social Security No (SSN)": "ssn",
    Ethnicity: "ethnicity",
    "EEO Job Category": "eeo",
    "Passport Number": "passportNo"
  };
  return headerSelector[header] || header;
};
