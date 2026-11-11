import { useFormik } from "formik";
import { DateTime } from "luxon";
import { FC, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { pickedDayToInstant } from "~community/common/utils/dateTimeUtils";
import { ActivityTaskEditPayload } from "~community/crm/activities/types/activityTypes";
import {
  toActivityTaskEditPayload,
  toActivityTaskFormValues
} from "~community/crm/activities/utils/activityUtil";
import PriorityDropdown from "~community/crm/components/molecules/PriorityDropdown/PriorityDropdown";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import SidePanelActivityInfo from "~community/crm/components/molecules/SidePanelActivityInfo/SidePanelActivityInfo";
import SidePanelContactField from "~community/crm/components/molecules/SidePanelContactField/SidePanelContactField";
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
  onContactClick: () => void;
  onCompanyClick: () => void;
}

const SidePanelActivityTaskInfo: FC<Props> = ({
  task,
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
  const displayZone = useDisplayZone();

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
    if (task.contact) {
      setContacts(updateContactRecord(contacts, [task.contact]));
    }
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

  useActivityAutoSave(formik);

  const { values, setFieldValue } = formik;

  const handleDueDateChange = (date: Date): void => {
    setFieldValue("dueAt", pickedDayToInstant(date, displayZone));
  };

  return (
    <SidePanelActivityInfo
      id="activity-task"
      primaryRow={
        <>
          <PropertyRow
            label={translateText(["tasks", "sidePanel", "info", "contactName"])}
          >
            <SidePanelContactField
              id="activity-task-contact"
              contactId={values.contactId}
              emptyLabel={translateText([
                "activities",
                "activitySidePanel",
                "info",
                "noValue"
              ])}
              editAriaLabel={translateAria(["editContact"])}
              onContactClick={onContactClick}
              onChange={(contactId) => setFieldValue("contactId", contactId)}
            />
          </PropertyRow>

          <PropertyRow
            label={translateText(["tasks", "sidePanel", "info", "priority"])}
          >
            <PriorityDropdown
              value={values.priority}
              onChange={(priority) => setFieldValue("priority", priority)}
            />
          </PropertyRow>
        </>
      }
      date={
        values.dueAt
          ? DateTime.fromISO(values.dueAt)
          : DateTime.fromISO(task.dueAt)
      }
      dateLabel={translateText([
        "activities",
        "taskSidePanel",
        "info",
        "dueDate"
      ])}
      hideStartTime
      {...(values.ownerId && { owner: owners[values.ownerId] })}
      companyId={values.companyId}
      onCompanyClick={onCompanyClick}
      onDateChange={handleDueDateChange}
      onOwnerChange={(ownerId) => setFieldValue("ownerId", ownerId)}
      onCompanyChange={(companyId) => setFieldValue("companyId", companyId)}
    />
  );
};

export default SidePanelActivityTaskInfo;
