import { useEffect, useState } from "react";

import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";
import useGetDefaultCountryCode from "~community/people/hooks/useGetDefaultCountryCode";
import { usePeopleStore } from "~community/people/store/store";
import {
  EmergencyContactDetailsType,
  FamilyMemberType,
  ManagerStoreType
} from "~community/people/types/AddNewResourceTypes";
import {
  EducationalDetailsResponseType,
  EmergencyContactDetailsResponseType,
  EmployeeDetails,
  EmployeeManagerType,
  FamilyMemberResponseType,
  Manager,
  TeamResultsType
} from "~community/people/types/EmployeeTypes";

import { ManagerTypes } from "../types/CommonTypes";

const useGetProfileDetails = () => {
  const {
    resetEmployeeData,
    setEmployeeGeneralDetails,
    setEmployeeContactDetails,
    setEmployeeFamilyDetails,
    setEmployeeEducationalDetails,
    setEmployeeSocialMediaDetails,
    setEmployeeHealthAndOtherDetails,
    setEmployeePrimaryEmergencyContactDetails,
    setEmployeeSecondaryEmergencyContactDetails,
    setEmployeeEmploymentDetails,
    setEmployeeCareerDetails,
    setEmployeeIdentificationAndDiversityDetails,
    setEmployeePreviousEmploymentDetails,
    setEmployeeVisaDetails,
    setEmployeeProfileDetails,
    reinitializeFormik,
    resetEmployeeDataChanges
  } = usePeopleStore((state) => state);
  const countryCode = useGetDefaultCountryCode();
  const [isRefetchingData, setIsRefetchingData] = useState<boolean>(false);

  const { data: employee, isSuccess, isLoading } = useGetUserPersonalDetails();

  useEffect(() => {
    if (employee && isRefetchingData) {
      resetEmployeeData();
      setIsRefetchingData(false);
      resetEmployeeDataChanges();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee]);

  const setSelectedEmployeeGeneralDetails = (employee: EmployeeDetails) => {
    setEmployeeGeneralDetails("authPic", employee?.authPic);
    setEmployeeGeneralDetails("firstName", employee?.firstName);
    setEmployeeGeneralDetails("middleName", employee?.middleName);
    setEmployeeGeneralDetails("lastName", employee?.lastName);
    setEmployeeGeneralDetails("gender", employee?.gender);
    setEmployeeGeneralDetails("birthDate", employee?.personalInfo?.birthDate);
    setEmployeeGeneralDetails(
      "nationality",
      employee?.personalInfo?.nationality
    );
    setEmployeeGeneralDetails("nin", employee?.personalInfo?.nin);
    setEmployeeGeneralDetails(
      "passportNumber",
      employee?.personalInfo?.passportNo
    );
    setEmployeeGeneralDetails(
      "maritalStatus",
      employee?.personalInfo?.maritalStatus
    );
  };

  const setSelectedEmployeeContactDetails = (employee: EmployeeDetails) => {
    setEmployeeContactDetails("personalEmail", employee?.personalEmail);
    setEmployeeContactDetails(
      "countryCode",
      employee?.phone?.split(" ")[0] || countryCode
    );
    setEmployeeContactDetails("phone", employee?.phone?.split(" ")[1]);
    setEmployeeContactDetails("addressLine1", employee?.address);
    setEmployeeContactDetails("addressLine2", employee?.addressLine2);
    setEmployeeContactDetails("city", employee?.personalInfo?.city);
    setEmployeeContactDetails("country", employee?.country);
    setEmployeeContactDetails("state", employee?.personalInfo?.state);
    setEmployeeContactDetails("postalCode", employee?.personalInfo?.postalCode);
  };

  const setSelectedEmployeeFamilyDetails = (employee: EmployeeDetails) => {
    const familiesResponse: FamilyMemberResponseType[] =
      employee?.employeeFamilies;
    const families: FamilyMemberType[] = familiesResponse?.map((family) => {
      return {
        ...(family.familyId ? { familyId: family.familyId } : {}),
        firstName: family?.firstName,
        lastName: family?.lastName,
        gender: family?.gender,
        relationship: family?.familyRelationship,
        birthDate: family?.birthDate,
        parentName: family?.parentName
      };
    });

    setEmployeeFamilyDetails(families);
  };

  const setSelectedEmployeeEducationalDetails = (employee: EmployeeDetails) => {
    const educationalDetailsResponse: EducationalDetailsResponseType[] =
      employee?.employeeEducations;
    const educationalDetails = educationalDetailsResponse?.map((education) => {
      return {
        ...(education.educationId
          ? { educationId: education.educationId }
          : {}),
        institutionName: education?.institution,
        degree: education?.degree,
        major: education?.specialization,
        startDate: education?.startDate,
        endDate: education?.endDate
      };
    });
    setEmployeeEducationalDetails(educationalDetails);
  };

  const setSelectedEmployeeSocialMediaDetails = (employee: EmployeeDetails) => {
    setEmployeeSocialMediaDetails(
      "linkedIn",
      employee?.personalInfo?.socialMediaDetails?.linkedIn
    );
    setEmployeeSocialMediaDetails(
      "facebook",
      employee?.personalInfo?.socialMediaDetails?.facebook
    );
    setEmployeeSocialMediaDetails(
      "instagram",
      employee?.personalInfo?.socialMediaDetails?.instagram
    );
    setEmployeeSocialMediaDetails(
      "x",
      employee?.personalInfo?.socialMediaDetails?.x
    );
  };

  const setSelectedEmployeeHealthAndOtherDetails = (
    employee: EmployeeDetails
  ) => {
    setEmployeeHealthAndOtherDetails(
      "bloodGroup",
      employee?.personalInfo?.extraInfo?.bloodGroup
    );
    setEmployeeHealthAndOtherDetails(
      "allergies",
      employee?.personalInfo?.extraInfo?.allergies
    );
    setEmployeeHealthAndOtherDetails(
      "dietaryRestrictions",
      employee?.personalInfo?.extraInfo?.dietaryRestrictions
    );
    setEmployeeHealthAndOtherDetails(
      "tshirtSize",
      employee?.personalInfo?.extraInfo?.tshirtSize
    );
  };

  const setSelectedEmployeeEmergencyContactDetails = (
    employee: EmployeeDetails
  ) => {
    const primaryEmergencyContactResponse: EmergencyContactDetailsResponseType =
      employee?.employeeEmergencies?.find(
        (emergency) => emergency?.isPrimary
      ) as EmergencyContactDetailsResponseType;
    const secondaryEmergencyContactResponse: EmergencyContactDetailsResponseType =
      employee?.employeeEmergencies?.find(
        (emergency) => !emergency?.isPrimary
      ) as EmergencyContactDetailsResponseType;

    const primaryEmployeeEmergencyContact: EmergencyContactDetailsType = {
      emergencyId: primaryEmergencyContactResponse?.emergencyId,
      name: primaryEmergencyContactResponse?.name || "",
      relationship:
        primaryEmergencyContactResponse?.emergencyRelationship || "",
      countryCode:
        primaryEmergencyContactResponse?.contactNo?.split(" ")[0] ||
        countryCode,
      phone: primaryEmergencyContactResponse?.contactNo?.split(" ")[1] || ""
    };

    const secondaryEmployeeEmergencyContact: EmergencyContactDetailsType = {
      emergencyId: secondaryEmergencyContactResponse?.emergencyId,
      name: secondaryEmergencyContactResponse?.name || "",
      relationship:
        secondaryEmergencyContactResponse?.emergencyRelationship || "",
      countryCode:
        secondaryEmergencyContactResponse?.contactNo?.split(" ")[0] ||
        countryCode,
      phone: secondaryEmergencyContactResponse?.contactNo?.split(" ")[1] || ""
    };

    setEmployeePrimaryEmergencyContactDetails(
      "emergencyId",
      primaryEmployeeEmergencyContact?.emergencyId ?? ""
    );
    setEmployeePrimaryEmergencyContactDetails(
      "name",
      primaryEmployeeEmergencyContact?.name
    );
    setEmployeePrimaryEmergencyContactDetails(
      "relationship",
      primaryEmployeeEmergencyContact?.relationship
    );
    setEmployeePrimaryEmergencyContactDetails(
      "phone",
      primaryEmployeeEmergencyContact?.phone
    );
    setEmployeePrimaryEmergencyContactDetails(
      "countryCode",
      primaryEmployeeEmergencyContact?.countryCode
    );

    setEmployeeSecondaryEmergencyContactDetails(
      "emergencyId",
      secondaryEmployeeEmergencyContact?.emergencyId ?? ""
    );
    setEmployeeSecondaryEmergencyContactDetails(
      "name",
      secondaryEmployeeEmergencyContact?.name
    );
    setEmployeeSecondaryEmergencyContactDetails(
      "relationship",
      secondaryEmployeeEmergencyContact?.relationship
    );
    setEmployeeSecondaryEmergencyContactDetails(
      "phone",
      secondaryEmployeeEmergencyContact?.phone
    );
    setEmployeeSecondaryEmergencyContactDetails(
      "countryCode",
      secondaryEmployeeEmergencyContact?.countryCode
    );
  };

  const preProcessManager = (
    employeeManager: EmployeeManagerType
  ): ManagerStoreType => {
    const manager: Manager = employeeManager?.manager;
    return {
      employeeId: manager?.employeeId?.toString(),
      firstName: manager?.firstName ?? "",
      lastName: manager?.lastName ?? "",
      avatarUrl: manager?.authPic ?? ""
    };
  };

  const setSelectedEmployeeEmploymentDetails = (employee: EmployeeDetails) => {
    setEmployeeEmploymentDetails("employeeNumber", employee?.identificationNo);
    setEmployeeEmploymentDetails("workEmail", employee?.email);
    setEmployeeEmploymentDetails(
      "employmentAllocation",
      employee?.employmentAllocation
    );
    setEmployeeEmploymentDetails(
      "teams",
      (employee?.teams as TeamResultsType[] | undefined)
        ?.map((teamObject: TeamResultsType) => teamObject?.team?.teamId)
        ?.filter((teamId): teamId is string | number => teamId !== undefined)
        ?.sort((a, b) => {
          if (typeof a === "number" && typeof b === "number") {
            return a - b;
          } else if (typeof a === "string" && typeof b === "string") {
            return a.localeCompare(b);
          } else {
            return 0;
          }
        })
    );
    setEmployeeEmploymentDetails(
      "primarySupervisor",
      preProcessManager(
        employee?.managers?.find(
          (manager) => manager?.managerType === ManagerTypes.PRIMARY
        ) as EmployeeManagerType
      )
    );
    setEmployeeEmploymentDetails(
      "secondarySupervisor",
      preProcessManager(
        employee?.managers?.find(
          (manager) => manager?.managerType === ManagerTypes.SECONDARY
        ) as EmployeeManagerType
      )
    );
    setEmployeeEmploymentDetails("joinedDate", employee?.joinDate);
    setEmployeeEmploymentDetails(
      "probationStartDate",
      employee?.periodResponseDto?.startDate
    );
    setEmployeeEmploymentDetails(
      "probationEndDate",
      employee?.periodResponseDto?.endDate
    );
    setEmployeeEmploymentDetails("workTimeZone", employee?.timeZone);
  };

  const setSelectedEmployeeCareerDetails = (employee: EmployeeDetails) => {
    const positionDetails = employee?.employeeProgressions?.map(
      (progression) => {
        return {
          ...(progression.progressionId
            ? { progressionId: progression.progressionId }
            : {}),
          employeeType: progression?.employeeType,
          jobFamily: progression?.jobRole?.jobRoleId,
          jobTitle: progression?.jobLevel?.jobLevelId,
          startDate: progression?.startDate,
          endDate: progression?.endDate,
          currentPosition: progression?.endDate === null
        };
      }
    );

    setEmployeeCareerDetails(positionDetails as any);
  };

  const setSelectedEmployeeIdentificationAndDiversityDetails = (
    employee: EmployeeDetails
  ) => {
    setEmployeeIdentificationAndDiversityDetails(
      "ssn",
      employee?.personalInfo?.ssn ?? ""
    );
    setEmployeeIdentificationAndDiversityDetails(
      "ethnicity",
      employee?.personalInfo?.ethnicity ?? ""
    );
    setEmployeeIdentificationAndDiversityDetails(
      "eeoJobCategory",
      employee?.eeo ?? ""
    );
  };

  const setSelectedEmployeePreviousEmploymentDetails = (
    employee: EmployeeDetails
  ) => {
    setEmployeePreviousEmploymentDetails(
      employee?.personalInfo?.previousEmploymentDetails || []
    );
  };

  const setSelectedEmployeeVisaDetails = (employee: EmployeeDetails) => {
    setEmployeeVisaDetails(employee?.employeeVisas);
  };

  const setSelectedEmployeeProfileDetails = (employee: EmployeeDetails) => {
    setEmployeeProfileDetails(
      "teams",
      employee?.teams?.map((team) => team as any)
    );
    setEmployeeProfileDetails(
      "careerDetails",
      employee?.employeeProgressions?.map((progression) => {
        return {
          employeeType: progression?.employeeType ?? "",
          jobFamily: progression?.jobRole?.name ?? "",
          jobTitle: progression?.jobLevel?.name ?? "",
          startDate: progression?.startDate ?? "",
          endDate: progression?.endDate ?? "",
          currentPosition: progression?.endDate === null
        };
      }) as []
    );
  };

  const setEmployeeData = () => {
    if (!employee) return;
    setSelectedEmployeeGeneralDetails(employee);
    setSelectedEmployeeContactDetails(employee);
    setSelectedEmployeeFamilyDetails(employee);
    setSelectedEmployeeEducationalDetails(employee);
    setSelectedEmployeeSocialMediaDetails(employee);
    setSelectedEmployeeHealthAndOtherDetails(employee);
    setSelectedEmployeeEmergencyContactDetails(employee);
    setSelectedEmployeeEmploymentDetails(employee);
    setSelectedEmployeeCareerDetails(employee);
    setSelectedEmployeeIdentificationAndDiversityDetails(employee);
    setSelectedEmployeePreviousEmploymentDetails(employee);
    setSelectedEmployeeVisaDetails(employee);
    setSelectedEmployeeProfileDetails(employee);
    reinitializeFormik();
  };

  const refetchProfileData = async () => {
    setIsRefetchingData(true);
  };

  const discardEmployeeData = () => {
    resetEmployeeData();
  };

  return {
    employee,
    isSuccess,
    isLoading,
    setEmployeeData,
    refetchProfileData,
    discardEmployeeData
  };
};

export default useGetProfileDetails;
