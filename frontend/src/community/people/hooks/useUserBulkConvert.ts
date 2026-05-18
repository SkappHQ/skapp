import { AccountStatus } from "~community/leave/types/LeaveTypes";
import { SystemPermissionTypes } from "~community/people/types/AddNewResourceTypes";
import {
  BulkEmployeeDetails,
  EmploymentTypes,
  RelationshipTypes
} from "~community/people/types/EmployeeTypes";
import { BulkUploadUser } from "~community/people/types/UserBulkUploadTypes";

import { AllJobFamilyType } from "../types/JobFamilyTypes";
import {
  AllocationSelector,
  BloodGroupSelector,
  EeoSelector,
  EthnicitySelector,
  TitleSelector,
  replaceEmptyStringsWithNull
} from "../utils/userBulkUploadUtils";

const useUserBulkConvert = () => {
  const convertUsers = (
    userArray: BulkUploadUser[],
    jobRoleList: AllJobFamilyType[]
  ) => {
    const newUserArray: BulkEmployeeDetails[] = userArray?.reduce(
      (acc: BulkEmployeeDetails[], user) => {
        const teamIds = user?.teams
          ? (user?.teams as string)
              ?.split(",")
              ?.map((team: string) => team?.trim())
          : null;

        const jobFamilyObject = jobRoleList?.find((jobFamilyItem) => {
          return (
            jobFamilyItem?.name?.toLowerCase() ===
            (user?.jobFamilyId as string)?.toLowerCase()
          );
        });

        const jobTitleObject = jobFamilyObject
          ? jobFamilyObject?.jobTitles?.find(
              (jobLevelItem: { name: string }) =>
                jobLevelItem?.name?.toLocaleLowerCase() ===
                (user?.jobTitleId as string)?.toLowerCase()
            )
          : undefined;

        const newUser: BulkEmployeeDetails = {
          teams: teamIds,
          title: user?.title
            ? (TitleSelector[user?.title] ?? user?.title)
            : null,
          firstName: user?.firstName,
          middleName: user?.middleName,
          lastName: user?.lastName,
          address: user?.address,
          addressLine2: user?.addressLine2,
          country: user?.country,
          personalEmail: user?.personalEmail,
          workEmail: user?.workEmail,
          gender: user?.gender?.toUpperCase(),
          phone:
            user?.contactNoDialCode?.split("+")[1] && user?.contactNo
              ? `${user?.phoneDialCode?.split("+")[1]} ${user?.phone}`
              : null,
          identificationNo: user?.identificationNo,
          permission: SystemPermissionTypes.EMPLOYEES,
          timeZone: String(user?.timeZone?.split("-")[0])?.trim(),
          workLocation: user?.workLocation ?? null,
          primaryManager: user?.primaryManager,
          joinedDate: user?.joinedDate,
          accountStatus: AccountStatus.PENDING,
          employmentAllocation: user?.employmentAllocation
            ? AllocationSelector[user?.employmentAllocation]
            : null,
          eeo: user?.eeo ? EeoSelector[user?.eeo] : null,
          employeePersonalInfo: {
            city: user?.city,
            state: user?.state,
            postalCode: user?.postalCode,
            birthDate: user?.birthDate,
            maritalStatus: user?.maritalStatus
              ? user?.maritalStatus?.toUpperCase()
              : null,
            nationality: user?.nationality,
            nin: user?.nin,
            ethnicity: user?.ethnicity
              ? EthnicitySelector[user?.ethnicity]
              : null,
            ssn: user?.ssn,
            socialMediaDetails: {
              facebook: user?.facebook,
              x: user?.x,
              linkedIn: user?.linkedIn,
              instagram: user?.instagram
            },
            extraInfo: {
              allergies: user?.allergies,
              dietaryRestrictions: user?.dietaryRestrictions,
              tshirtSize: user?.tshirtSize,
              bloodGroup: user?.bloodGroup
                ? BloodGroupSelector[user?.bloodGroup]
                : null
            },
            passportNo: user?.passportNo
          },
          employeePeriod: {
            startDate: user?.startDate,
            endDate: user?.endDate
          },
          employeeEmergency: {
            name: user?.name,
            emergencyRelationship: user?.emergencyRelationship
              ? (user?.emergencyRelationship?.toUpperCase() as RelationshipTypes)
              : null,
            contactNo:
              user?.contactNoDialCode?.split("+")[1] && user?.contactNo
                ? `${user?.contactNoDialCode?.split("+")[1]} ${user?.contactNo}`
                : null,
            isPrimary: true
          },
          employeeProgression: {
            employeeType: user?.employeeType
              ? (user?.employeeType?.toUpperCase() as EmploymentTypes)
              : null,
            jobFamilyId: jobFamilyObject ? jobFamilyObject?.jobFamilyId : null,
            jobTitleId: jobTitleObject ? jobTitleObject?.jobTitleId : null,
            startDate: user?.joinedDate,
            endDate: null,
            isCurrent: true
          }
        };

        acc?.push(replaceEmptyStringsWithNull(newUser) as BulkEmployeeDetails);
        return acc;
      },
      []
    );
    return newUserArray;
  };
  return { convertUsers };
};

export default useUserBulkConvert;
