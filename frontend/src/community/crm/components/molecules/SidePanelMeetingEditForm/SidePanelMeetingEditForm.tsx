import { useFormik } from "formik";
import { FC, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ActivityMeetingEditPayload } from "~community/crm/activities/types/activityTypes";
import {
  toMeetingEditPayload,
  toMeetingFormValues
} from "~community/crm/activities/utils/activityUtil";
import LogMeetingModalForm from "~community/crm/components/molecules/LogMeetingModalForm/LogMeetingModalForm";
import { useActivityAutoSave } from "~community/crm/hooks/useActivityAutoSave";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmLogMeetingFormValues,
  CrmMeetingEntity
} from "~community/crm/types/CrmCommonTypes";
import { updateCompanyRecord } from "~community/crm/utils/companyUtil";
import { updateContactRecord } from "~community/crm/utils/contactUtil";
import { getMeetingValidationSchema } from "~community/crm/utils/meetingValidations";

interface Props {
  meeting: CrmMeetingEntity;
  onSave: (payload: ActivityMeetingEditPayload) => void;
}

const SidePanelMeetingEditForm: FC<Props> = ({ meeting, onSave }) => {
  const translateText = useTranslator("crmModule");

  const { contacts, setContacts, companies, setCompanies } = useCrmStore(
    useShallow((state) => ({
      contacts: state.contacts,
      setContacts: state.setContacts,
      companies: state.companies,
      setCompanies: state.setCompanies
    }))
  );

  useEffect(() => {
    setContacts(updateContactRecord(contacts, meeting.contacts));
    if (meeting.company) {
      setCompanies(updateCompanyRecord(companies, [meeting.company]));
    }
  }, [meeting]);

  const initialValues = useMemo(
    () => toMeetingFormValues(meeting),
    [meeting.id]
  );

  const formik = useFormik<CrmLogMeetingFormValues>({
    initialValues,
    validationSchema: getMeetingValidationSchema(translateText),
    onSubmit: (values, { resetForm }) => {
      onSave(toMeetingEditPayload(meeting.id, values, formik.initialValues));
      resetForm({ values });
    }
  });

  const autoSaveFormik = useActivityAutoSave(formik, []);

  return <LogMeetingModalForm formik={autoSaveFormik} isDetailsOnly />;
};

export default SidePanelMeetingEditForm;
