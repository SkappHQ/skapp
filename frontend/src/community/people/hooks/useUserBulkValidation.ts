import { characterLengths } from "~community/common/constants/stringConstants";
import {
  hasOnlyAlphaNumericWithSpecialCharacters,
  isValidAlphaNumericString,
  isValidNameWithAccentsAndApostrophes,
  isValidUrlPattern
} from "~community/common/regex/regexPatterns";
import {
  dateValidation,
  isEmailInputValid
} from "~community/common/utils/validation";
import { BulkUploadUser } from "~community/people/types/UserBulkUploadTypes";

import { USER_BULK_HEADERS } from "../utils/constants/constants";

const useUserBulkValidation = () => {
  const validateUser = (user: BulkUploadUser) => {
    return (
      user?.firstName &&
      user?.firstName?.length <= characterLengths.NAME_LENGTH &&
      (!user?.middleName ||
        user?.middleName?.length <= characterLengths.NAME_LENGTH) &&
      user?.lastName &&
      user?.lastName?.length <= characterLengths.NAME_LENGTH &&
      user?.gender &&
      user?.birthDate &&
      dateValidation(user?.birthDate) &&
      user?.nationality &&
      user?.nin &&
      user?.nin?.length <= characterLengths.NIN_LENGTH &&
      isValidAlphaNumericString().test(user?.nin) &&
      user?.maritalStatus &&
      user?.personalEmail &&
      isEmailInputValid(user?.personalEmail) &&
      user?.phoneDialCode &&
      user?.phone &&
      user?.phone?.length <= characterLengths.PHONE_NUMBER_LENGTH_MAX &&
      user?.phone?.length >= characterLengths.PHONE_NUMBER_LENGTH_MIN &&
      user?.addressLine1 &&
      user?.city &&
      user?.city?.length <= characterLengths.STATE_LENGTH &&
      user?.country &&
      user?.state &&
      user?.state?.length <= characterLengths.STATE_LENGTH &&
      (!user?.linkedIn || isValidUrlPattern().test(user?.linkedIn)) &&
      (!user?.facebook || isValidUrlPattern().test(user?.facebook)) &&
      (!user?.instagram || isValidUrlPattern().test(user?.instagram)) &&
      (!user?.x || isValidUrlPattern().test(user?.x)) &&
      user?.name &&
      isValidNameWithAccentsAndApostrophes().test(user?.name) &&
      user?.emergencyRelationship &&
      user?.contactNoDialCode &&
      user?.contactNo &&
      user?.phone?.length <= characterLengths.PHONE_NUMBER_LENGTH_MAX &&
      user?.phone?.length >= characterLengths.PHONE_NUMBER_LENGTH_MIN &&
      user?.identificationNo &&
      user?.identificationNo.length <= characterLengths.EMPLOYEE_ID_LENGTH &&
      hasOnlyAlphaNumericWithSpecialCharacters().test(user?.identificationNo) &&
      user?.workEmail &&
      isEmailInputValid(user?.workEmail) &&
      user?.employmentAllocation &&
      user?.joinedDate &&
      dateValidation(user?.joinedDate) &&
      (!user?.primaryManager || isEmailInputValid(user?.primaryManager)) &&
      (!user?.probationStartDate || dateValidation(user?.probationStartDate)) &&
      (!user?.probationEndDate || dateValidation(user?.probationEndDate)) &&
      (!user?.careerProgressionStartDate ||
        dateValidation(user?.careerProgressionStartDate)) &&
      validateCareerProgressionFields(user) &&
      user?.passportNo
    );
  };

  const validateCareerProgressionFields = (user: BulkUploadUser) => {
    const hasEmployeeType = !!user?.employeeType;
    const hasJobFamily = !!user?.jobFamily;
    const hasJobTitle = !!user?.jobTitle;
    const hasStartDate = !!user?.careerProgressionStartDate;
    const anyProvided =
      hasEmployeeType || hasJobFamily || hasJobTitle || hasStartDate;
    const allProvided =
      hasEmployeeType && hasJobFamily && hasJobTitle && hasStartDate;
    return !anyProvided || allProvided;
  };

  const isArrayOfUsersValid = (userArray: BulkUploadUser[]) => {
    return userArray?.every(validateUser);
  };

  const isCsvValid = (userArray: BulkUploadUser[]) => {
    const headerList = Object.keys(userArray?.[0]).filter(Boolean);
    return (
      headerList?.length === USER_BULK_HEADERS?.length &&
      USER_BULK_HEADERS?.every((header) => headerList?.includes(header))
    );
  };

  return {
    isArrayOfUsersValid,
    isCsvValid
  };
};

export default useUserBulkValidation;
