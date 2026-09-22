import { ButtonV2, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import { SEARCH_DEBOUNCE_DELAY } from "~community/common/constants/commonConstants";
import useDebounce from "~community/common/hooks/useDebounce";
import useSessionData from "~community/common/hooks/useSessionData";
import { isValidEmail } from "~community/common/regex/regexPatterns";
import { useCheckContactEmailExists } from "~community/crm/v2/api/ContactApi";
import EditableContactCompanyField from "~community/crm/v2/components/molecules/EditableContactCompanyField/EditableContactCompanyField";
import EditableContactOwnerField from "~community/crm/v2/components/molecules/EditableContactOwnerField/EditableContactOwnerField";
import SelectedOwnerField from "~community/crm/v2/components/molecules/SelectedOwnerField/SelectedOwnerField";
import {
  CONTACT_EMAIL_MAX_LENGTH,
  CONTACT_NAME_MAX_LENGTH,
  CONTACT_NUMBER_MAX_LENGTH
} from "~community/crm/v2/constants/contactConstants";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmContactEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getOwnerById } from "~community/crm/v2/utils/commonUtil";
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

const useContactEmailCheck = ({
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

interface ContactModalFormProps {
  formik: FormikProps<CrmContactEntity>;
  isPending: boolean;
  isEdit?: boolean;
  originalEmail?: string;
  canAddNewCompany?: boolean;
  onCancel: () => void;
}

const ContactModalForm: FC<ContactModalFormProps> = ({
  formik,
  isPending,
  isEdit,
  originalEmail,
  canAddNewCompany,
  onCancel
}) => {
  const translateText = useTranslator("crmModuleV2");
  const translateAria = useTranslator("crmAriaV2");
  const { isCrmSalesManager: canEditOwner } = useSessionData();

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    dirty,
    isSubmitting,
    setFieldValue,
    submitForm
  } = formik;

  const owners = useCrmStoreV2(useShallow((state) => state.owners));

  const { isDuplicateEmail, isEmailCheckUnresolved, suggestedDomain } =
    useContactEmailCheck({ email: values.email, originalEmail });

  const selectedOwner = getOwnerById(owners, values.ownerId);

  const emailFieldError = touched.email ? errors.email : undefined;

  const emailError = isDuplicateEmail
    ? translateText(["contacts", "modal", "validations", "emailExists"])
    : emailFieldError;

  return (
    <div className="flex flex-col h-full justify-between gap-[0.625rem]">
      <InputField
        name="name"
        value={values.name}
        errorMessage={touched.name ? errors.name : undefined}
        state={touched.name && errors.name ? "error" : "default"}
        label={translateText(["contacts", "modal", "labels", "name"])}
        placeholder={translateText([
          "contacts",
          "modal",
          "placeholders",
          "name"
        ])}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateAria(["contacts", "modal", "name"])}
        maxLength={CONTACT_NAME_MAX_LENGTH}
        required
        fullWidth
      />

      <InputField
        name="email"
        value={values.email}
        errorMessage={emailError}
        state={emailError ? "error" : "default"}
        label={translateText(["contacts", "modal", "labels", "email"])}
        placeholder={translateText([
          "contacts",
          "modal",
          "placeholders",
          "email"
        ])}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateAria(["contacts", "modal", "email"])}
        maxLength={CONTACT_EMAIL_MAX_LENGTH}
        required
        fullWidth
      />

      <EditableContactCompanyField
        isEdit={isEdit}
        companyId={values.companyId}
        companyName={values.companyName}
        suggestedDomain={suggestedDomain}
        canAddNewCompany={canAddNewCompany}
        onSelect={(companyId) => {
          setFieldValue("companyId", companyId);
          setFieldValue("companyName", undefined);
        }}
        onAddNew={(companyName) => setFieldValue("companyName", companyName)}
        onClear={() => {
          setFieldValue("companyId", null);
          setFieldValue("companyName", undefined);
        }}
      />

      <InputField
        name="contactNumber"
        value={values.contactNumber}
        errorMessage={touched.contactNumber ? errors.contactNumber : undefined}
        state={
          touched.contactNumber && errors.contactNumber ? "error" : "default"
        }
        label={translateText(["contacts", "modal", "labels", "contactNumber"])}
        placeholder={translateText([
          "contacts",
          "modal",
          "placeholders",
          "contactNumber"
        ])}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateAria(["contacts", "modal", "contactNumber"])}
        maxLength={CONTACT_NUMBER_MAX_LENGTH}
        fullWidth
      />

      {canEditOwner ? (
        <EditableContactOwnerField
          ownerId={values.ownerId}
          errorMessage={touched.ownerId ? errors.ownerId : undefined}
          onChange={(owner) => setFieldValue("ownerId", owner?.employeeId)}
        />
      ) : (
        selectedOwner && (
          <SelectedOwnerField
            label={translateText(["contacts", "modal", "labels", "owner"])}
            owner={selectedOwner}
            onRemove={() => setFieldValue("ownerId", undefined)}
            showRemoveButton={false}
            ariaLabel={translateAria(["contacts", "modal", "clearOwner"])}
          />
        )
      )}

      <div className="flex flex-row justify-end py-[0.85rem] gap-[1rem]">
        <ButtonV2
          variant="tertiary"
          type="button"
          disabled={isPending || isSubmitting}
          onClick={onCancel}
          icon={<CloseIcon />}
          iconPosition="end"
          aria-label={translateAria([
            "contacts",
            "modal",
            "cancel",
            isEdit ? "edit" : "add"
          ])}
        >
          {translateText(["contacts", "modal", "buttons", "cancel"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          type="button"
          onClick={submitForm}
          disabled={
            isPending ||
            isSubmitting ||
            !dirty ||
            isEmailCheckUnresolved ||
            isDuplicateEmail
          }
          isLoading={isPending}
          aria-label={translateAria(["contacts", "modal", "save"])}
        >
          {translateText(["contacts", "modal", "buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default ContactModalForm;
