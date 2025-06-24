import { useCallback, useEffect, useRef } from "react";

import { ManagerTypes } from "~community/common/types/CommonTypes";
import {
  getUserPersonalDetails,
  useGetEmployeeById
} from "~community/people/api/PeopleApi";
import { usePeopleStore } from "~community/people/store/store";
import {
  EEOJobCategoryTypes,
  EmergencyContactDetailsType,
  EmployeeType,
  EmploymentAllocationTypes,
  FamilyMemberType,
  GenderTypes,
  ManagerStoreType,
  PositionDetailsType,
  SystemPermissionTypes,
  VisaDetailsType
} from "~community/people/types/AddNewResourceTypes";
import {
  EducationalDetailsResponseType,
  EmergencyContactDetailsResponseType,
  EmployeeDetails,
  EmployeeManagerType,
  EmploymentTypes,
  FamilyMemberResponseType,
  Manager,
  TeamResultsType
} from "~community/people/types/EmployeeTypes";

import useGetDefaultCountryCode from "./useGetDefaultCountryCode";

interface GetEmployeeParams {
  id?: number;
  isProfile?: boolean;
}

const useDetectChange = ({ id, isProfile = false }: GetEmployeeParams) => {
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
    employeeVisaDetails
  } = usePeopleStore((state) => state);
  const countryCode = useGetDefaultCountryCode();
  const employeeRef = useRef<EmployeeDetails | undefined>();

  const getEmployeeById = useGetEmployeeById(id as number);

  if (!isProfile) {
    const { data } = getEmployeeById;
    employeeRef.current = data;
  }

  useEffect(() => {
    if (isProfile) {
      const getUserData = async () => {
        const userData = await getUserPersonalDetails();
        employeeRef.current = userData?.data?.results[0];
      };
      void getUserData();
    }
  }, [
    isProfile,
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
    employeeVisaDetails
  ]);

  const employee = employeeRef.current;

  const immutableFields = ["webkitRelativePath"];

  const preProcessManager = (
    employeeManager: EmployeeManagerType
  ): ManagerStoreType => {
    const manager: Manager = employeeManager?.manager;
    return {
      employeeId: manager?.employeeId?.toString() || undefined,
      firstName: manager?.firstName || "",
      lastName: manager?.lastName || "",
      avatarUrl: manager?.authPic || ""
    };
  };

  const replaceEmptyStringsWithUndefined = useCallback((obj: any) => {
    const copyOfObject = Object.assign({}, obj);

    for (const key in copyOfObject) {
      if (
        typeof copyOfObject[key] === "string" &&
        copyOfObject[key] === "" &&
        !immutableFields.includes(key)
      ) {
        copyOfObject[key] = undefined;
      } else if (
        typeof copyOfObject[key] === "object" &&
        copyOfObject[key] !== null
      ) {
        replaceEmptyStringsWithUndefined(copyOfObject[key]);
      }
    }
    return copyOfObject;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValuesChanged = useCallback(() => {
    const familiesResponse: FamilyMemberResponseType[] =
      employee?.employeeFamilies as FamilyMemberResponseType[];

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

    const educationalDetailsResponse: EducationalDetailsResponseType[] =
      employee?.employeeEducations as EducationalDetailsResponseType[];
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

    const primaryEmergencyContactResponse: EmergencyContactDetailsResponseType =
      employee?.employeeEmergencies?.find(
        (emergency) => emergency?.isPrimary
      ) as EmergencyContactDetailsResponseType;
    const secondaryEmergencyContactResponse: EmergencyContactDetailsResponseType =
      employee?.employeeEmergencies?.find(
        (emergency) => !emergency?.isPrimary
      ) as EmergencyContactDetailsResponseType;

    const primaryEmployeeEmergencyContact: EmergencyContactDetailsType =
      primaryEmergencyContactResponse &&
      ({
        name: primaryEmergencyContactResponse?.name,
        relationship: primaryEmergencyContactResponse?.emergencyRelationship,
        countryCode:
          primaryEmergencyContactResponse?.contactNo?.split(" ")[0] ||
          countryCode,
        phone: primaryEmergencyContactResponse?.contactNo?.split(" ")[1] ?? "",
        emergencyId: primaryEmergencyContactResponse?.emergencyId
      } as EmergencyContactDetailsType);

    const secondaryEmployeeEmergencyContact: EmergencyContactDetailsType =
      secondaryEmergencyContactResponse &&
      ({
        name: secondaryEmergencyContactResponse?.name,
        relationship: secondaryEmergencyContactResponse?.emergencyRelationship,
        countryCode:
          secondaryEmergencyContactResponse?.contactNo?.split(" ")[0] ||
          countryCode,
        phone:
          secondaryEmergencyContactResponse?.contactNo?.split(" ")[1] ?? "",
        emergencyId: secondaryEmergencyContactResponse?.emergencyId
      } as EmergencyContactDetailsType);
    const positionDetails = employee?.employeeProgressions?.map(
      (progression) => {
        return {
          ...(progression.progressionId
            ? { progressionId: progression.progressionId }
            : {}),
          employeeType: progression?.employeeType as EmploymentTypes,
          jobFamily: progression?.jobFamily?.jobFamilyId,
          jobTitle: progression?.jobTitle?.jobTitleId,
          startDate: progression?.startDate,
          endDate: progression?.endDate,
          currentPosition: progression?.endDate === null
        };
      }
    ) as PositionDetailsType[];

    const previousEmployeeData: EmployeeType = {
      employeeId: employee?.employeeId,
      generalDetails: {
        authPic: employee?.authPic,
        thumbnail: "",
        firstName: employee?.firstName,
        middleName: employee?.middleName,
        lastName: employee?.lastName,
        gender: employee?.gender as GenderTypes,
        birthDate: employee?.personalInfo?.birthDate ?? "",
        nationality: employee?.personalInfo?.nationality ?? "",
        nin: employee?.personalInfo?.nin ?? "",
        passportNumber: employee?.personalInfo?.passportNo,
        maritalStatus: employee?.personalInfo?.maritalStatus
      },
      contactDetails: {
        personalEmail: employee?.personalEmail,
        countryCode: employee?.phone?.split(" ")[0] || countryCode,
        phone: employee?.phone?.split(" ")[1],
        addressLine1: employee?.address,
        addressLine2: employee?.addressLine2,
        city: employee?.personalInfo?.city,
        country: employee?.country,
        state: employee?.personalInfo?.state,
        postalCode: employee?.personalInfo?.postalCode
      },
      familyDetails: {
        familyMembers: families
      },
      educationalDetails: {
        educationalDetails
      },
      socialMediaDetails: {
        linkedIn: employee?.personalInfo?.socialMediaDetails?.linkedIn,
        facebook: employee?.personalInfo?.socialMediaDetails?.facebook,
        instagram: employee?.personalInfo?.socialMediaDetails?.instagram,
        x: employee?.personalInfo?.socialMediaDetails?.x
      },
      healthAndOtherDetails: {
        bloodGroup: employee?.personalInfo?.extraInfo?.bloodGroup,
        allergies: employee?.personalInfo?.extraInfo?.allergies,
        dietaryRestrictions:
          employee?.personalInfo?.extraInfo?.dietaryRestrictions,
        tshirtSize: employee?.personalInfo?.extraInfo?.tshirtSize
      },
      emergencyDetails: {
        primaryEmergencyContact: primaryEmployeeEmergencyContact,
        secondaryEmergencyContact: secondaryEmployeeEmergencyContact
      },
      employmentDetails: {
        employeeNumber: employee?.identificationNo,
        workEmail: employee?.email ?? "",
        employmentAllocation:
          employee?.employmentAllocation as EmploymentAllocationTypes,
        systemPermission: SystemPermissionTypes.EMPLOYEES,
        teams: (employee?.teams as TeamResultsType[] | undefined)
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
          }) as number[],
        primarySupervisor: isProfile
          ? preProcessManager(
              employee?.managers?.find(
                (manager) => manager?.managerType === ManagerTypes.PRIMARY
              ) as EmployeeManagerType
            )
          : preProcessManager(
              employee?.employees?.find(
                (manager) => manager?.managerType === ManagerTypes.PRIMARY
              ) as EmployeeManagerType
            ),
        secondarySupervisor: isProfile
          ? preProcessManager(
              employee?.managers?.find(
                (manager) => manager?.managerType === ManagerTypes.SECONDARY
              ) as EmployeeManagerType
            )
          : preProcessManager(
              employee?.employees?.find(
                (manager) => manager?.managerType === ManagerTypes.SECONDARY
              ) as EmployeeManagerType
            ),
        joinedDate: employee?.joinDate,
        probationStartDate: employee?.periodResponseDto?.startDate,
        probationEndDate: employee?.periodResponseDto?.endDate,
        workTimeZone: employee?.timeZone
      },
      careerDetails: {
        positionDetails
      },
      identificationAndDiversityDetails: {
        ssn: employee?.personalInfo?.ssn,
        ethnicity: employee?.personalInfo?.ethnicity,
        eeoJobCategory: employee?.eeo as EEOJobCategoryTypes
      },
      previousEmploymentDetails: {
        previousEmploymentDetails:
          employee?.personalInfo?.previousEmploymentDetails || []
      },
      visaDetails: {
        visaDetails: employee?.employeeVisas as VisaDetailsType[]
      },
      userRoles: undefined as any
    };

    const updatedEmployeeData: EmployeeType = {
      employeeId: employee?.employeeId,
      generalDetails: {
        ...employeeGeneralDetails
      },
      contactDetails: employeeContactDetails,
      familyDetails: employeeFamilyDetails,
      educationalDetails: employeeEducationalDetails,
      socialMediaDetails: employeeSocialMediaDetails,
      healthAndOtherDetails: employeeHealthAndOtherDetails,
      emergencyDetails: {
        primaryEmergencyContact:
          employeeEmergencyContactDetails?.primaryEmergencyContact?.name ||
          employeeEmergencyContactDetails?.primaryEmergencyContact?.phone ||
          employeeEmergencyContactDetails?.primaryEmergencyContact?.relationship
            ? employeeEmergencyContactDetails?.primaryEmergencyContact
            : undefined,
        secondaryEmergencyContact:
          employeeEmergencyContactDetails?.secondaryEmergencyContact?.name ||
          employeeEmergencyContactDetails?.secondaryEmergencyContact?.phone ||
          employeeEmergencyContactDetails?.secondaryEmergencyContact
            ?.relationship
            ? employeeEmergencyContactDetails?.secondaryEmergencyContact
            : undefined
      } as any,
      employmentDetails: {
        ...employeeEmploymentDetails,
        primarySupervisor: {
          employeeId: employeeEmploymentDetails?.primarySupervisor?.employeeId,
          firstName: employeeEmploymentDetails?.primarySupervisor?.firstName,
          lastName: employeeEmploymentDetails?.primarySupervisor?.lastName,
          avatarUrl: employeeEmploymentDetails?.primarySupervisor?.avatarUrl
        },
        secondarySupervisor: {
          employeeId:
            employeeEmploymentDetails?.secondarySupervisor?.employeeId,
          firstName: employeeEmploymentDetails?.secondarySupervisor?.firstName,
          lastName: employeeEmploymentDetails?.secondarySupervisor?.lastName,
          avatarUrl: employeeEmploymentDetails?.secondarySupervisor?.avatarUrl
        },
        teams: employeeEmploymentDetails?.teams?.sort(
          (a: number, b: number) => a - b
        )
      },
      careerDetails: employeeCareerDetails,
      identificationAndDiversityDetails:
        employeeIdentificationAndDiversityDetails,
      previousEmploymentDetails: employeePreviousEmploymentDetails,
      visaDetails: employeeVisaDetails,
      userRoles: undefined as any
    };

    const isChanged =
      JSON.stringify(replaceEmptyStringsWithUndefined(previousEmployeeData)) !==
      JSON.stringify(replaceEmptyStringsWithUndefined(updatedEmployeeData));

    return isChanged;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
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
    employee,
    replaceEmptyStringsWithUndefined
  ]);

  return {
    isValuesChanged
  };
};

export default useDetectChange;
