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
  /** The typed address already belongs to another contact. */
  isDuplicateEmail: boolean;
  /** The address changed but the exists-check has not answered yet. */
  isEmailCheckUnresolved: boolean;
  /** Domain of a settled, valid address, used to suggest a company. */
  suggestedDomain: string;
}

/**
 * Checks a contact email against the existing contacts while it is typed.
 * Both the check and the domain suggestion run on the debounced value, so the
 * contact's own address never reports itself as a duplicate mid-edit.
 */
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
