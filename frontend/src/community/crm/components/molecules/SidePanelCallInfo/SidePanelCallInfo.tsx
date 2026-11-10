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
import { getCallValidationSchema } from "~community/crm/utils/callValidations";
import { updateCompanyRecord } from "~community/crm/utils/companyUtil";
import { updateContactRecord } from "~community/crm/utils/contactUtil";

interface Props {
  call: CrmCallEntity;
  onSave: (payload: ActivityCallEditPayload) => void;
  onContactClick: () => void;
  onCompanyClick: () => void;
}

const SidePanelCallInfo: FC<Props> = ({
  call,
  onSave,
  onContactClick,
  onCompanyClick
}) => {
  const translateText = useTranslator("crmModule");
  const translateInfo = useTranslator("crmModule", "activities");
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

  const { values, setFieldValue } = formik;

  const validateDuration = (duration: string): string =>
    duration && !callDurationPattern().test(duration)
      ? translateInfo(["logCall", "modal", "validations", "duration"])
      : "";

  const handleDateChange = (date: Date): void => {
    setFieldValue("date", toDateFieldValue(date));
  };

  return (
    <SidePanelActivityInfo
      id="call"
      primaryRow={
        <PropertyRow
          label={translateInfo(["callSidePanel", "info", "contact"])}
        >
          <SidePanelContactField
            id="call-contact"
            contactId={values.contactId}
            emptyLabel={translateInfo([
              "activitySidePanel",
              "info",
              "noLongerAvailable"
            ])}
            editAriaLabel={translateAria(["editContact"])}
            onContactClick={onContactClick}
            onChange={(contactId) => setFieldValue("contactId", contactId)}
          />
        </PropertyRow>
      }
      date={
        values.date
          ? DateTime.fromISO(values.date)
          : DateTime.fromISO(call.loggedAt)
      }
      dateLabel={translateInfo(["activitySidePanel", "info", "date"])}
      startTime={DateTime.fromFormat(values.time, TIME_FORMAT_24_HOUR)}
      secondaryRow={
        <PropertyRow
          label={translateInfo(["callSidePanel", "info", "duration"])}
        >
          <SidePanelTextField
            id="call-duration"
            value={values.duration}
            placeholder={translateInfo([
              "activitySidePanel",
              "info",
              "noValue"
            ])}
            ariaLabel={translateAria(["editDuration"])}
            validate={validateDuration}
            onSave={(duration) => setFieldValue("duration", duration)}
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
