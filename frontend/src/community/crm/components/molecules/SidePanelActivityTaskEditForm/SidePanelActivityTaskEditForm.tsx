import { useFormik } from "formik";
import { FC, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { ActivityTaskEditPayload } from "~community/crm/activities/types/activityTypes";
import {
  toActivityTaskEditPayload,
  toActivityTaskFormValues
} from "~community/crm/activities/utils/activityUtil";
import AddActivityTaskModalForm from "~community/crm/components/molecules/AddActivityTaskModalForm/AddActivityTaskModalForm";
import { useActivityAutoSave } from "~community/crm/hooks/useActivityAutoSave";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmActivityTaskEntity,
  CrmAddTaskFormValues
} from "~community/crm/types/CrmCommonTypes";
import { getActivityTaskValidationSchema } from "~community/crm/utils/activityTaskValidations";
import { updateCompanyRecord } from "~community/crm/utils/companyUtil";
import { updateContactRecord } from "~community/crm/utils/contactUtil";

interface Props {
  task: CrmActivityTaskEntity;
  onSave: (payload: ActivityTaskEditPayload) => void;
}

const SidePanelActivityTaskEditForm: FC<Props> = ({ task, onSave }) => {
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
    if (task.contact)
      setContacts(updateContactRecord(contacts, [task.contact]));
    if (task.company) {
      setCompanies(updateCompanyRecord(companies, [task.company]));
    }
  }, [task]);

  const initialValues = useMemo(
    () => toActivityTaskFormValues(task),
    [task.id]
  );

  const formik = useFormik<CrmAddTaskFormValues>({
    initialValues,
    validationSchema: getActivityTaskValidationSchema(translateText),
    onSubmit: (values, { resetForm }) => {
      onSave(toActivityTaskEditPayload(task.id, values, formik.initialValues));
      resetForm({ values });
    }
  });

  const autoSaveFormik = useActivityAutoSave(formik, []);

  return <AddActivityTaskModalForm formik={autoSaveFormik} isDetailsOnly />;
};

export default SidePanelActivityTaskEditForm;
