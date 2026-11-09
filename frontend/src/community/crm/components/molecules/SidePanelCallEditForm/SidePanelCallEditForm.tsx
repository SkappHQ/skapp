import { useFormik } from "formik";
import { FC, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ActivityCallEditPayload } from "~community/crm/activities/types/activityTypes";
import {
  toCallEditPayload,
  toCallFormValues
} from "~community/crm/activities/utils/activityUtil";
import LogCallModalForm from "~community/crm/components/molecules/LogCallModalForm/LogCallModalForm";
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
}

const SidePanelCallEditForm: FC<Props> = ({ call, onSave }) => {
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
    if (call.contact)
      setContacts(updateContactRecord(contacts, [call.contact]));
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

  const autoSaveFormik = useActivityAutoSave(formik, ["duration"]);

  return <LogCallModalForm formik={autoSaveFormik} isDetailsOnly />;
};

export default SidePanelCallEditForm;
