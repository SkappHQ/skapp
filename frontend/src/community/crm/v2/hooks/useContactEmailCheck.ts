import { SEARCH_DEBOUNCE_DELAY } from "~community/common/constants/commonConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import { isValidEmail } from "~community/common/regex/regexPatterns";
import { useCheckContactEmailExists } from "~community/crm/v2/api/ContactApi";
import { getEmailDomain } from "~community/crm/v2/utils/contactUtil";

interface UseContactEmailCheckParams {
  email?: string;
  originalEmail?: string;
}

interface UseContactEmailCheckReturn {
  isDuplicateEmail: boolean;
  isEmailCheckUnresolved: boolean;
  suggestedDomain: string;
}

export const useContactEmailCheck = ({
  email,
  originalEmail
}: UseContactEmailCheckParams): UseContactEmailCheckReturn => {
  const trimmedEmail = email?.trim() ?? "";
  const trimmedOriginalEmail = originalEmail?.trim() ?? "";

  const debouncedEmail = useDebounce(trimmedEmail, SEARCH_DEBOUNCE_DELAY);

  const isEmailChanged = trimmedEmail !== trimmedOriginalEmail;
  const isDebouncedEmailChanged = debouncedEmail !== trimmedOriginalEmail;
  const isDebouncedEmailValid = isValidEmail().test(debouncedEmail);

  const isEmailCheckEnabled = isDebouncedEmailValid && isDebouncedEmailChanged;

  const { data: emailExistsData, isFetching } = useCheckContactEmailExists(
    debouncedEmail,
    isEmailCheckEnabled
  );

  return {
    isDuplicateEmail:
      isDebouncedEmailChanged && emailExistsData?.isExists === true,
    isEmailCheckUnresolved:
      isEmailChanged && (trimmedEmail !== debouncedEmail || isFetching),
    suggestedDomain: isDebouncedEmailValid ? getEmailDomain(debouncedEmail) : ""
  };
};
