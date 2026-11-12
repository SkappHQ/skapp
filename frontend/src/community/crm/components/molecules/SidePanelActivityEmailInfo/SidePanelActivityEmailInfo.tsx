import { useFormik } from "formik";
import { DateTime } from "luxon";
import { FC, ReactNode, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { TIME_FORMAT_24_HOUR } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { isValidEmail } from "~community/common/regex/regexPatterns";
import { ActivityEmailEditPayload } from "~community/crm/activities/types/activityTypes";
import {
  toDateFieldValue,
  toEmailEditPayload,
  toEmailFormValues
} from "~community/crm/activities/utils/activityUtil";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import SidePanelActivityInfo from "~community/crm/components/molecules/SidePanelActivityInfo/SidePanelActivityInfo";
import SidePanelContactsField from "~community/crm/components/molecules/SidePanelContactsField/SidePanelContactsField";
import SidePanelTextField from "~community/crm/components/molecules/SidePanelTextField/SidePanelTextField";
import { useActivityAutoSave } from "~community/crm/hooks/useActivityAutoSave";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmActivityEmailEntity,
  CrmLogEmailFormValues
} from "~community/crm/types/CrmCommonTypes";
import { updateCompanyRecord } from "~community/crm/utils/companyUtil";
import { updateContactRecord } from "~community/crm/utils/contactUtil";
import { getEmailValidationSchema } from "~community/crm/utils/emailValidations";

interface Props {
  email: CrmActivityEmailEntity;
  onSave: (payload: ActivityEmailEditPayload) => void;
  onCompanyClick: () => void;
}

type RecipientField = "toContactIds" | "ccContactIds" | "bccContactIds";

const SidePanelActivityEmailInfo: FC<Props> = ({
  email,
  onSave,
  onCompanyClick
}) => {
  const translateModule = useTranslator("crmModule");
  const translateText = useTranslator("crmModule", "activities");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "emailSidePanel"
  );

  const { contacts, setContacts, companies, setCompanies, owners } =
    useCrmStore(
      useShallow((state) => ({
        contacts: state.contacts,
        setContacts: state.setContacts,
        companies: state.companies,
        setCompanies: state.setCompanies,
        owners: state.owners
      }))
    );

  useEffect(() => {
    setContacts(
      updateContactRecord(contacts, [...email.to, ...email.cc, ...email.bcc])
    );
    if (email.company) {
      setCompanies(updateCompanyRecord(companies, [email.company]));
    }
  }, [email]);

  const initialValues = useMemo(() => toEmailFormValues(email), [email.id]);

  const formik = useFormik<CrmLogEmailFormValues>({
    initialValues,
    validationSchema: getEmailValidationSchema(translateModule),
    onSubmit: (values, { resetForm }) => {
      onSave(toEmailEditPayload(email.id, values, formik.initialValues));
      resetForm({ values });
    }
  });

  useActivityAutoSave(formik);

  const { values, setFieldValue } = formik;

  const noValue = translateText(["activitySidePanel", "info", "noValue"]);

  const validateFromAddress = (fromAddress: string): string => {
    const trimmedAddress = fromAddress.trim();

    return trimmedAddress && !isValidEmail().test(trimmedAddress)
      ? translateModule(["contacts", "modal", "validations", "invalidEmail"])
      : "";
  };

  const renderRecipients = (
    field: RecipientField,
    titleKey: "to" | "cc" | "bcc",
    ariaKey: "editTo" | "editCc" | "editBcc"
  ): ReactNode => (
    <SidePanelContactsField
      id={`activity-email-${titleKey}`}
      title={translateText(["emailSidePanel", "info", titleKey])}
      selectedLabel={translateText([
        "emailSidePanel",
        "info",
        "selectedRecipients"
      ])}
      searchPlaceholder={translateText([
        "emailSidePanel",
        "info",
        "searchContacts"
      ])}
      editAriaLabel={translateAria([ariaKey])}
      emptyLabel={noValue}
      isRequired={field === "toContactIds"}
      contactIds={values[field]}
      onChange={(contactIds) => setFieldValue(field, contactIds)}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      {renderRecipients("toContactIds", "to", "editTo")}
      {renderRecipients("ccContactIds", "cc", "editCc")}
      {renderRecipients("bccContactIds", "bcc", "editBcc")}

      <SidePanelActivityInfo
        id="email"
        primaryRow={
          <PropertyRow
            label={translateText(["emailSidePanel", "info", "from"])}
          >
            <SidePanelTextField
              id="email-from"
              value={values.fromAddress}
              placeholder={noValue}
              ariaLabel={translateAria(["editFrom"])}
              validate={validateFromAddress}
              onSave={(fromAddress) =>
                setFieldValue("fromAddress", fromAddress)
              }
            />
          </PropertyRow>
        }
        date={
          values.date
            ? DateTime.fromISO(values.date)
            : DateTime.fromISO(email.loggedAt)
        }
        dateLabel={translateText(["activitySidePanel", "info", "date"])}
        startTime={DateTime.fromFormat(values.time, TIME_FORMAT_24_HOUR)}
        startTimeLabel={translateText(["emailSidePanel", "info", "time"])}
        {...(values.ownerId && { owner: owners[values.ownerId] })}
        companyId={values.companyId}
        onCompanyClick={onCompanyClick}
        onDateChange={(date) => setFieldValue("date", toDateFieldValue(date))}
        onStartTimeChange={(time) => setFieldValue("time", time)}
        onOwnerChange={(ownerId) => setFieldValue("ownerId", ownerId)}
        onCompanyChange={(companyId) => setFieldValue("companyId", companyId)}
      />
    </div>
  );
};

export default SidePanelActivityEmailInfo;
