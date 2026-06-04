import {
  formatDate,
  formatEmptyString,
  formatPhoneNumber
} from "~community/common/utils/commonUtil";

import { EmployeeType, VisaDetailsType } from "../types/AddNewResourceTypes";
import {
  EducationalDetailsResponseType,
  EmergencyContactDetailsResponseType,
  EmployeeDataType,
  EmployeeDetails,
  FamilyMemberResponseType
} from "../types/EmployeeTypes";
import { JobFamilies, JobFamiliesType } from "../types/JobRolesTypes";

export const employeeCreatePreProcessor = (
  employee: EmployeeType
): EmployeeDetails => {
  return {
    firstName: employee?.generalDetails?.firstName,
    lastName: employee?.generalDetails?.lastName,
    middleName: formatEmptyString(employee?.generalDetails?.middleName ?? ""),
    title:
      employee?.generalDetails?.title === ""
        ? null
        : employee?.generalDetails?.title,
    address: employee?.contactDetails?.addressLine1,
    addressLine2: employee?.contactDetails?.addressLine2,
    authPic: employee?.generalDetails?.authPic,
    country: employee?.contactDetails?.country,
    personalEmail: employee?.contactDetails?.personalEmail,
    workEmail: employee?.employmentDetails?.workEmail,
    gender:
      employee?.generalDetails?.gender === ""
        ? null
        : employee?.generalDetails?.gender,
    phone:
      employee?.contactDetails?.phone &&
      formatPhoneNumber(
        employee?.contactDetails?.countryCode,
        employee?.contactDetails?.phone
      ),
    identificationNo: employee?.employmentDetails?.employeeNumber,
    timeZone: employee?.employmentDetails?.workTimeZone,
    primaryManager:
      parseInt(
        employee?.employmentDetails?.primarySupervisor?.employeeId?.toString() ??
          ""
      ) ?? null,
    secondaryManager:
      parseInt(
        employee?.employmentDetails?.secondarySupervisor?.employeeId?.toString() ??
          ""
      ) ?? null,
    joinDate:
      employee?.employmentDetails?.joinedDate &&
      formatDate(employee?.employmentDetails?.joinedDate),
    teams: employee?.employmentDetails?.teams ?? null,
    probationPeriod: {
      startDate:
        employee?.employmentDetails?.probationStartDate &&
        formatDate(employee?.employmentDetails?.probationStartDate),
      endDate:
        employee?.employmentDetails?.probationEndDate &&
        formatDate(employee?.employmentDetails?.probationEndDate)
    },
    employmentAllocation: employee?.employmentDetails?.employmentAllocation,
    employmentStatus: employee?.employmentDetails?.employmentStatus ?? "",
    employeeProgressions:
      employee?.careerDetails?.positionDetails?.length > 0
        ? employee?.careerDetails?.positionDetails?.map((position) => ({
            employeeType: position?.employeeType ?? "",
            jobFamilyId: position?.jobFamily ?? "",
            jobTitleId: position?.jobTitle ?? "",
            startDate: formatDate(position?.startDate) ?? "",
            endDate: formatDate(position?.endDate) ?? "",
            isCurrent: position?.currentPosition
          }))
        : [],
    eeo: employee?.identificationAndDiversityDetails?.eeoJobCategory,
    employeeVisas:
      employee?.visaDetails?.visaDetails?.length > 0
        ? employee?.visaDetails?.visaDetails?.map((visa) => ({
            visaType: visa?.visaType,
            issuingCountry: visa?.issuingCountry ?? "",
            issuedDate: formatDate(visa?.issuedDate) ?? "",
            expirationDate: formatDate(visa?.expirationDate) ?? ""
          }))
        : ([] as VisaDetailsType[]),
    employeeEmergency: [
      {
        name: employee?.emergencyDetails?.primaryEmergencyContact?.name,
        emergencyRelationship:
          employee?.emergencyDetails?.primaryEmergencyContact?.relationship,
        contactNo: formatPhoneNumber(
          employee?.emergencyDetails?.primaryEmergencyContact?.countryCode,
          employee?.emergencyDetails?.primaryEmergencyContact?.phone
        ),
        isPrimary: true
      },
      {
        name: employee?.emergencyDetails?.secondaryEmergencyContact?.name,
        emergencyRelationship:
          employee?.emergencyDetails?.secondaryEmergencyContact?.relationship,
        contactNo:
          formatPhoneNumber(
            employee?.emergencyDetails?.secondaryEmergencyContact?.countryCode,
            employee?.emergencyDetails?.secondaryEmergencyContact?.phone
          ) ?? "",
        isPrimary: false
      }
    ].filter(
      (contact) =>
        contact?.name && contact?.emergencyRelationship && contact?.contactNo
    ),
    employeePersonalInfo: {
      city: employee?.contactDetails?.city,
      state: employee?.contactDetails?.state,
      birthDate:
        employee?.generalDetails?.birthDate &&
        formatDate(employee?.generalDetails?.birthDate),
      maritalStatus: employee?.generalDetails?.maritalStatus,
      nationality: employee?.generalDetails?.nationality,
      nin: employee?.generalDetails?.nin,
      ethnicity: employee?.identificationAndDiversityDetails.ethnicity,
      ssn: employee?.identificationAndDiversityDetails.ssn,
      postalCode: employee?.contactDetails?.postalCode,
      passportNo: employee?.generalDetails?.passportNumber,
      previousEmploymentDetails:
        employee?.previousEmploymentDetails.previousEmploymentDetails.map(
          (employment) => ({
            companyName: employment?.companyName,
            jobTitle: employment?.jobTitle ?? "",
            startDate: formatDate(employment?.startDate) ?? "",
            endDate: formatDate(employment?.endDate) ?? ""
          })
        ),
      socialMediaDetails: {
        facebook: employee?.socialMediaDetails?.facebook,
        linkedIn: employee?.socialMediaDetails?.linkedIn,
        x: employee?.socialMediaDetails?.x,
        instagram: employee?.socialMediaDetails?.instagram
      },
      extraInfo: {
        bloodGroup: employee?.healthAndOtherDetails?.bloodGroup,
        allergies: employee?.healthAndOtherDetails?.allergies,
        dietaryRestrictions:
          employee?.healthAndOtherDetails?.dietaryRestrictions,
        tshirtSize: employee?.healthAndOtherDetails?.tshirtSize
      }
    },
    employeeFamilies:
      employee?.familyDetails.familyMembers?.length > 0
        ? employee?.familyDetails.familyMembers.map((family) => ({
            firstName: family?.firstName,
            lastName: family?.lastName,
            parentName: family?.parentName,
            gender: family?.gender,
            birthDate: formatDate(family?.birthDate) ?? "",
            familyRelationship: family?.relationship
          }))
        : ([] as FamilyMemberResponseType[]),
    employeeEducations:
      employee?.educationalDetails.educationalDetails?.length > 0
        ? employee?.educationalDetails?.educationalDetails?.map(
            (education) => ({
              institution: education?.institutionName,
              degree: education?.degree,
              specialization: education?.major,
              startDate: formatDate(education?.startDate) ?? "",
              endDate: formatDate(education?.endDate) ?? ""
            })
          )
        : ([] as EducationalDetailsResponseType[]),
    userRoles: employee.userRoles
  } as unknown as EmployeeDetails;
};

export function searchEmployeeDataPreProcessor(
  employeeList: EmployeeDetails[]
): EmployeeDataType[] {
  const preProcessedData: EmployeeDataType[] = employeeList?.map(
    (employee: EmployeeDetails) => {
      return {
        employeeId: employee.employeeId as number,
        employeeName: employee.name ?? "",
        firstName: employee.firstName ?? "",
        lastName: employee.lastName ?? "",
        avatarUrl: employee.authPic ?? "",
        jobRole: employee.jobFamily ? employee.jobFamily.name : "",
        jobLevel: employee.jobTitle ? employee.jobTitle.name : "",
        team: employee.teams,
        permission: employee.permission ?? "",
        email: employee.email ?? "",
        authPic: employee.authPic ?? ""
      };
    }
  ) as EmployeeDataType[];
  return preProcessedData;
}

export function GetRolePreProcessor(
  jobRoleList: JobFamiliesType[]
): JobFamilies[] {
  const preProcessedData = jobRoleList?.map((jobRole: JobFamiliesType) => {
    return {
      jobFamilyId: jobRole?.jobFamilyId,
      name: jobRole?.name,
      jobTitles: jobRole?.jobTitles
    };
  });

  return preProcessedData;
}

export const employeeUpdatePreProcessor = (
  employee: EmployeeType
): EmployeeDetails => {
  return {
    firstName: employee?.generalDetails?.firstName,
    lastName: employee?.generalDetails?.lastName,
    middleName:
      employee?.generalDetails?.middleName &&
      formatEmptyString(employee?.generalDetails?.middleName),
    title: employee?.generalDetails?.title,
    address: employee?.contactDetails?.addressLine1,
    addressLine2: employee?.contactDetails?.addressLine2,
    authPic: employee?.generalDetails?.authPic,
    country: employee?.contactDetails?.country,
    personalEmail: employee?.contactDetails?.personalEmail,
    email: employee?.employmentDetails?.workEmail,
    gender: employee?.generalDetails?.gender,
    phone:
      employee?.contactDetails?.phone &&
      employee?.contactDetails?.countryCode &&
      formatPhoneNumber(
        employee?.contactDetails?.countryCode,
        employee?.contactDetails?.phone
      ),
    identificationNo: employee?.employmentDetails?.employeeNumber,
    timeZone: employee?.employmentDetails?.workTimeZone,
    primaryManager:
      parseInt(
        employee?.employmentDetails?.primarySupervisor?.employeeId?.toString() ??
          ""
      ) ?? null,
    secondaryManager:
      parseInt(
        employee?.employmentDetails?.secondarySupervisor?.employeeId?.toString() ??
          ""
      ) ?? null,
    joinDate:
      employee?.employmentDetails?.joinedDate &&
      formatDate(employee?.employmentDetails?.joinedDate),
    teams: employee?.employmentDetails?.teams,
    employeePeriod: {
      startDate:
        employee?.employmentDetails?.probationStartDate &&
        (formatDate(employee?.employmentDetails?.probationStartDate) as string),
      endDate:
        employee?.employmentDetails?.probationEndDate &&
        (formatDate(employee?.employmentDetails?.probationEndDate) as string)
    },
    employmentAllocation: employee?.employmentDetails?.employmentAllocation,
    employmentStatus: employee?.employmentDetails?.employmentStatus as string,
    employeeProgressions:
      employee?.careerDetails?.positionDetails?.length > 0
        ? employee?.careerDetails?.positionDetails?.map((position) => ({
            ...(position?.progressionId
              ? { progressionId: position?.progressionId }
              : {}),
            employeeType: position?.employeeType ?? "",
            jobFamilyId: position?.jobFamily ?? "",
            jobTitleId: position?.jobTitle ?? "",
            startDate: formatDate(position?.startDate) ?? "",
            endDate: formatDate(position?.endDate) ?? "",
            isCurrent: position?.currentPosition
          }))
        : [],
    eeo: employee?.identificationAndDiversityDetails?.eeoJobCategory,
    employeeVisas: employee?.visaDetails.visaDetails.map((visa) => ({
      ...(visa?.visaId ? { visaId: visa?.visaId } : {}),
      visaType: visa?.visaType,
      issuingCountry: visa?.issuingCountry as string,
      issuedDate: formatDate(visa?.issuedDate) as string,
      expirationDate: formatDate(visa?.expirationDate) as string
    })),
    employeeEmergency: [
      {
        emergencyId:
          employee?.emergencyDetails?.primaryEmergencyContact?.emergencyId ??
          null,
        name: employee?.emergencyDetails?.primaryEmergencyContact?.name,
        emergencyRelationship:
          employee?.emergencyDetails?.primaryEmergencyContact?.relationship,
        contactNo: formatPhoneNumber(
          employee?.emergencyDetails?.primaryEmergencyContact?.countryCode,
          employee?.emergencyDetails?.primaryEmergencyContact?.phone
        ),
        isPrimary: true
      },
      {
        emergencyId:
          employee?.emergencyDetails?.secondaryEmergencyContact?.emergencyId ??
          null,
        name: employee?.emergencyDetails?.secondaryEmergencyContact?.name,
        emergencyRelationship:
          employee?.emergencyDetails?.secondaryEmergencyContact?.relationship,
        contactNo:
          formatPhoneNumber(
            employee?.emergencyDetails?.secondaryEmergencyContact?.countryCode,
            employee?.emergencyDetails?.secondaryEmergencyContact?.phone
          ) ?? "",
        isPrimary: false
      }
    ].filter(
      (contact) =>
        contact?.name && contact?.emergencyRelationship && contact?.contactNo
    ) as EmergencyContactDetailsResponseType[],
    employeePersonalInfo: {
      city: employee?.contactDetails?.city,
      state: employee?.contactDetails?.state,
      birthDate:
        employee?.generalDetails?.birthDate &&
        formatDate(employee?.generalDetails?.birthDate),
      maritalStatus: employee?.generalDetails?.maritalStatus,
      nationality: employee?.generalDetails?.nationality,
      nin: employee?.generalDetails?.nin,
      ethnicity: employee?.identificationAndDiversityDetails.ethnicity,
      ssn: employee?.identificationAndDiversityDetails.ssn,
      postalCode: employee?.contactDetails?.postalCode,
      passportNo: employee?.generalDetails?.passportNumber,
      previousEmploymentDetails:
        employee?.previousEmploymentDetails.previousEmploymentDetails.map(
          (employment) => ({
            companyName: employment?.companyName,
            jobTitle: employment?.jobTitle ?? "",
            startDate: formatDate(employment?.startDate) ?? "",
            endDate: formatDate(employment?.endDate) ?? ""
          })
        ),
      socialMediaDetails: {
        facebook: employee?.socialMediaDetails?.facebook,
        linkedIn: employee?.socialMediaDetails?.linkedIn,
        x: employee?.socialMediaDetails?.x,
        instagram: employee?.socialMediaDetails?.instagram
      },
      extraInfo: {
        bloodGroup: employee?.healthAndOtherDetails?.bloodGroup,
        allergies: employee?.healthAndOtherDetails?.allergies,
        dietaryRestrictions:
          employee?.healthAndOtherDetails?.dietaryRestrictions,
        tshirtSize: employee?.healthAndOtherDetails?.tshirtSize
      }
    },
    employeeFamilies: employee?.familyDetails?.familyMembers?.map((family) => ({
      ...(family?.familyId ? { familyId: family?.familyId } : {}),
      firstName: family?.firstName,
      lastName: family?.lastName ?? "",
      parentName: family?.parentName ?? "",
      gender: family?.gender,
      birthDate: formatDate(family?.birthDate) ?? "",
      familyRelationship: family?.relationship
    })),
    employeeEducations: employee?.educationalDetails?.educationalDetails?.map(
      (education) => ({
        ...(education?.educationId
          ? { educationId: education?.educationId }
          : {}),
        institution: education?.institutionName ?? "",
        degree: education?.degree ?? "",
        specialization: education?.major ?? "",
        startDate: formatDate(education?.startDate) ?? "",
        endDate: formatDate(education?.endDate) ?? ""
      })
    ),
    userRoles: employee.userRoles
  } as unknown as EmployeeDetails;
};
