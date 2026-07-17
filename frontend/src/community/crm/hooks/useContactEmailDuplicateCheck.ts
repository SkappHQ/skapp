import useDebounce from "~community/common/hooks/useDebounce";
import { isValidEmail } from "~community/common/regex/regexPatterns";
import { useCheckContactEmailExists } from "~community/crm/api/ContactApi";
import { SEARCH_DEBOUNCE_DELAY } from "~community/crm/constants/commonConstants";

interface UseContactEmailDuplicateCheckParams {
  email: string;
  originalEmail: string;
}

const useContactEmailDuplicateCheck = ({
  email,
  originalEmail
}: UseContactEmailDuplicateCheckParams) => {
  const trimmedEmail = email.trim();
  const trimmedOriginalEmail = originalEmail.trim();

  const debouncedEmail = useDebounce(trimmedEmail, SEARCH_DEBOUNCE_DELAY);

  const isEmailCheckEnabled =
    debouncedEmail.length > 0 &&
    isValidEmail().test(debouncedEmail) &&
    debouncedEmail !== trimmedOriginalEmail;

  const { data: emailExistsData, isFetching: isEmailCheckFetching } =
    useCheckContactEmailExists(debouncedEmail, isEmailCheckEnabled);

  const isDuplicateEmail =
    trimmedEmail === debouncedEmail &&
    trimmedEmail !== trimmedOriginalEmail &&
    (emailExistsData?.isExists ?? false);

  const isEmailCheckUnresolved =
    trimmedEmail.length > 0 &&
    trimmedEmail !== trimmedOriginalEmail &&
    (trimmedEmail !== debouncedEmail || isEmailCheckFetching);

  return { debouncedEmail, isDuplicateEmail, isEmailCheckUnresolved };
};

export default useContactEmailDuplicateCheck;
