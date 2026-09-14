import { ButtonV2, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC } from "react";
import { useShallow } from "zustand/react/shallow";

import useSessionData from "~community/common/hooks/useSessionData";
import { TranslatorFunctionType } from "~community/common/types/CommonTypes";
import EditableContactCompanyField from "~community/crm/v2/components/molecules/EditableContactCompanyField/EditableContactCompanyField";
import EditableContactOwnerField from "~community/crm/v2/components/molecules/EditableContactOwnerField/EditableContactOwnerField";
import SelectedOwnerField from "~community/crm/v2/components/molecules/SelectedOwnerField/SelectedOwnerField";
import {
  CONTACT_EMAIL_MAX_LENGTH,
  CONTACT_NAME_MAX_LENGTH,
  CONTACT_NUMBER_MAX_LENGTH
} from "~community/crm/v2/constants/contactConstants";
import { useContactEmailCheck } from "~community/crm/v2/hooks/useContactEmailCheck";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";
import { CrmContactEntity } from "~community/crm/v2/types/CrmCommonTypes";
import { getOwnerById } from "~community/crm/v2/utils/commonUtil";

interface ContactModalFormProps {
  formik: FormikProps<CrmContactEntity>;
  isPending: boolean;
  translateText: TranslatorFunctionType;
  originalEmail?: string;
  canAddNewCompany?: boolean;
  onCancel: () => void;
}

const ContactModalForm: FC<ContactModalFormProps> = ({
  formik,
  isPending,
  translateText,
  originalEmail,
  canAddNewCompany,
  onCancel
}) => {
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
    ? translateText(["validations", "emailExists"])
    : emailFieldError;

  return (
    <div className="flex flex-col h-full justify-between gap-[0.625rem]">
      <InputField
        name="name"
        value={values.name}
        errorMessage={touched.name ? errors.name : undefined}
        state={touched.name && errors.name ? "error" : "default"}
        label={translateText(["labels", "name"])}
        placeholder={translateText(["placeholders", "name"])}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateText(["ariaLabels", "name"])}
        maxLength={CONTACT_NAME_MAX_LENGTH}
        required
        fullWidth
      />

      <InputField
        name="email"
        value={values.email}
        errorMessage={emailError}
        state={emailError ? "error" : "default"}
        label={translateText(["labels", "email"])}
        placeholder={translateText(["placeholders", "email"])}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateText(["ariaLabels", "email"])}
        maxLength={CONTACT_EMAIL_MAX_LENGTH}
        required
        fullWidth
      />

      <EditableContactCompanyField
        companyId={values.companyId}
        companyName={values.companyName}
        suggestedDomain={suggestedDomain}
        translateText={translateText}
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
        label={translateText(["labels", "contactNumber"])}
        placeholder={translateText(["placeholders", "contactNumber"])}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateText(["ariaLabels", "contactNumber"])}
        maxLength={CONTACT_NUMBER_MAX_LENGTH}
        fullWidth
      />

      {canEditOwner ? (
        <EditableContactOwnerField
          ownerId={values.ownerId}
          errorMessage={touched.ownerId ? errors.ownerId : undefined}
          translateText={translateText}
          onChange={(owner) => setFieldValue("ownerId", owner?.employeeId)}
        />
      ) : (
        selectedOwner && (
          <SelectedOwnerField
            label={translateText(["labels", "owner"])}
            owner={selectedOwner}
            onRemove={() => setFieldValue("ownerId", undefined)}
            showRemoveButton={false}
            ariaLabel={translateText(["ariaLabels", "clearOwner"])}
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
          aria-label={translateText(["ariaLabels", "cancel"])}
        >
          {translateText(["buttons", "cancel"])}
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
          aria-label={translateText(["ariaLabels", "save"])}
        >
          {translateText(["buttons", "save"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default ContactModalForm;
