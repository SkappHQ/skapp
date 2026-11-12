import { useFormik } from "formik";
import { DateTime } from "luxon";
import { FC, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { TIME_FORMAT_24_HOUR } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { callDurationPattern } from "~community/common/regex/regexPatterns";
import { ActivityCallEditPayload } from "~community/crm/activities/types/activityTypes";
import {
  toCallEditPayload,
  toCallFormValues,
  toDateFieldValue
} from "~community/crm/activities/utils/activityUtil";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import SidePanelActivityInfo from "~community/crm/components/molecules/SidePanelActivityInfo/SidePanelActivityInfo";
import SidePanelContactField from "~community/crm/components/molecules/SidePanelContactField/SidePanelContactField";
import SidePanelTextField from "~community/crm/components/molecules/SidePanelTextField/SidePanelTextField";
import { useActivityAutoSave } from "~community/crm/hooks/useActivityAutoSave";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmCallEntity,
  CrmLogCallFormValues
} from "~community/crm/types/CrmCommonTypes";
import { formatCallDuration } from "~community/crm/utils/callUtil";
import {
  getCallValidationSchema,
  parseCallDurationToMinutes
} from "~community/crm/utils/callValidations";
import { updateCompanyRecord } from "~community/crm/utils/companyUtil";
import { updateContactRecord } from "~community/crm/utils/contactUtil";
import { isDealMatchingCompany } from "~community/crm/utils/dealUtil";

interface Props {
  call: CrmCallEntity;
  onSave: (payload: ActivityCallEditPayload) => void;
  onContactClick: (contactId: number) => void;
  onCompanyClick: (companyId: number) => void;
}

const SidePanelCallInfo: FC<Props> = ({
  call,
  onSave,
  onContactClick,
  onCompanyClick
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "activitySidePanel"
  );

  const { owners, contacts, setContacts, companies, setCompanies } =
    useCrmStore(
      useShallow((state) => ({
        owners: state.owners,
        contacts: state.contacts,
        setContacts: state.setContacts,
        companies: state.companies,
        setCompanies: state.setCompanies
      }))
    );

  useEffect(() => {
    if (call.contact) {
      setContacts(updateContactRecord(contacts, [call.contact]));
    }
    if (call.company) {
      setCompanies(updateCompanyRecord(companies, [call.company]));
    }
  }, [call]);

  const initialValues = useMemo(() => toCallFormValues(call), [call.id]);

  const formik = useFormik<CrmLogCallFormValues>({
    initialValues,
    validationSchema: getCallValidationSchema(translateText),
    onSubmit: (values, { resetForm }) => {
      onSave(toCallEditPayload(call.id, values, formik.initialValues));
      resetForm({ values });
    }
  });

  useActivityAutoSave(formik);

  const { values, setFieldValue, resetForm } = formik;

  const validateDuration = (duration: string): string =>
    duration.trim() && !callDurationPattern().test(duration.trim())
      ? translateText([
          "activities",
          "logCall",
          "modal",
          "validations",
          "duration"
        ])
      : "";

  const handleDurationSave = (duration: string): void => {
    const minutes = parseCallDurationToMinutes(duration);
    if (minutes) setFieldValue("duration", formatCallDuration(minutes));
  };

  const handleContactChange = (
    contactId: number,
    contactCompanyId?: number | null
  ): void => {
    if (call.deal && !isDealMatchingCompany(call.deal, contactCompanyId)) {
      onSave({ id: call.id, contactId, isDealRemoved: true });
      resetForm({ values: { ...values, contactId, dealId: null } });
      return;
    }

    setFieldValue("contactId", contactId);
  };

  const handleDateChange = (date: Date): void => {
    setFieldValue("date", toDateFieldValue(date));
  };

  return (
    <SidePanelActivityInfo
      id="call"
      primaryRow={
        <PropertyRow
          label={translateText([
            "activities",
            "callSidePanel",
            "info",
            "contact"
          ])}
        >
          <SidePanelContactField
            id="call-contact"
            contactId={values.contactId}
            emptyLabel={translateText([
              "activities",
              "activitySidePanel",
              "info",
              "noLongerAvailable"
            ])}
            editAriaLabel={translateAria(["editContact"])}
            onContactClick={onContactClick}
            onChange={handleContactChange}
          />
        </PropertyRow>
      }
      date={
        values.date
          ? DateTime.fromISO(values.date)
          : DateTime.fromISO(call.loggedAt)
      }
      dateLabel={translateText([
        "activities",
        "activitySidePanel",
        "info",
        "date"
      ])}
      startTime={DateTime.fromFormat(values.time, TIME_FORMAT_24_HOUR)}
      secondaryRow={
        <PropertyRow
          label={translateText([
            "activities",
            "callSidePanel",
            "info",
            "duration"
          ])}
        >
          <SidePanelTextField
            id="call-duration"
            value={values.duration}
            placeholder={translateText([
              "activities",
              "activitySidePanel",
              "info",
              "noValue"
            ])}
            ariaLabel={translateAria(["editDuration"])}
            validate={validateDuration}
            onSave={handleDurationSave}
          />
        </PropertyRow>
      }
      {...(values.ownerId && { owner: owners[values.ownerId] })}
      companyId={values.companyId}
      onCompanyClick={onCompanyClick}
      onDateChange={handleDateChange}
      onStartTimeChange={(time) => setFieldValue("time", time)}
      onOwnerChange={(ownerId) => setFieldValue("ownerId", ownerId)}
      onCompanyChange={(companyId) => setFieldValue("companyId", companyId)}
    />
  );
};

export default SidePanelCallInfo;
