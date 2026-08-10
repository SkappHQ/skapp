import { AccountStatus } from "~community/leave/types/LeaveTypes";
import { SystemPermissionTypes } from "~community/people/types/AddNewResourceTypes";
import {
  BulkEmployeeDetails,
  EmploymentTypes,
  RelationshipTypes
} from "~community/people/types/EmployeeTypes";
import { BulkUploadUser } from "~community/people/types/UserBulkUploadTypes";

import {
  AllocationSelector,
  BloodGroupSelector,
  EeoSelector,
  EthnicitySelector,
  TitleSelector,
  replaceEmptyStringsWithNull
} from "../utils/userBulkUploadUtils";

const useUserBulkConvert = () => {
  const convertUsers = (userArray: BulkUploadUser[]) => {
    const newUserArray: BulkEmployeeDetails[] = userArray?.reduce(
      (acc: BulkEmployeeDetails[], user) => {
        const teamNames = user?.teams
          ? (user?.teams as string)
              ?.split(",")
              ?.map((team: string) => team?.trim())
          : null;

        const newUser: BulkEmployeeDetails = {
          teams: teamNames,
          title: user?.title
            ? (TitleSelector[user?.title] ?? user?.title)
            : null,
          firstName: user?.firstName,
          middleName: user?.middleName,
          lastName: user?.lastName,
          addressLine1: user?.addressLine1,
          addressLine2: user?.addressLine2,
          country: user?.country,
          personalEmail: user?.personalEmail,
          workEmail: user?.workEmail,
          gender: user?.gender?.toUpperCase(),
          phone:
            user?.phoneDialCode?.split("+")[1] && user?.phone
              ? `${user?.phoneDialCode?.split("+")[1]} ${user?.phone}`
              : null,
          identificationNo: user?.identificationNo,
          payrollId: user?.payrollId,
          tin: user?.tin,
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
            bloodGroup: user?.bloodGroup
              ? BloodGroupSelector[user?.bloodGroup]
              : null,
            extraInfo: {
              allergies: user?.allergies,
              dietaryRestrictions: user?.dietaryRestrictions,
              tShirtSize: user?.tshirtSize
            },
            passportNo: user?.passportNo
          },
          employeePeriod: {
            startDate: user?.probationStartDate,
            endDate: user?.probationEndDate
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
          employeeType: user?.employeeType
            ? user?.employeeType?.toUpperCase()
            : null,
          jobFamily: user?.jobFamily,
          jobTitle: user?.jobTitle,
          employeeProgression: {
            employmentType: user?.employeeType
              ? (user?.employeeType?.toUpperCase() as EmploymentTypes)
              : null,
            startDate: user?.careerProgressionStartDate ?? null,
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
