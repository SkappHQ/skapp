import useDebounce from "~community/common/hooks/useDebounce";
import { useCheckDealNameExists } from "~community/crm/api/crmDealApi";
import {
  DEAL_NAME_DEBOUNCE_DELAY,
  DEAL_NAME_MAX_LENGTH
} from "~community/crm/constants/dealConstants";
import { isDealNameValid } from "~community/crm/regex/crmRegexPatterns";

const useDealNameDuplicateCheck = (
  name: string,
  currentName?: string
): boolean => {
  const trimmedName = name.trim();
  const debouncedName = useDebounce(trimmedName, DEAL_NAME_DEBOUNCE_DELAY);

  const isCheckable =
    debouncedName.length > 0 &&
    debouncedName.length <= DEAL_NAME_MAX_LENGTH &&
    isDealNameValid().test(debouncedName) &&
    debouncedName !== currentName?.trim();

  const { data } = useCheckDealNameExists(debouncedName, isCheckable);

  return (
    isCheckable && debouncedName === trimmedName && data?.isExists === true
  );
};

export default useDealNameDuplicateCheck;
