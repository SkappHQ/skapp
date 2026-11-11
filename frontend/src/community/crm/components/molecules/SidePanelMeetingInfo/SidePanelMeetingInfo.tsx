import { AvatarGroup } from "@rootcodelabs/skapp-ui";
import { useFormik } from "formik";
import { DateTime } from "luxon";
import { FC, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { TIME_FORMAT_24_HOUR } from "~community/common/constants/timeConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { ActivityMeetingEditPayload } from "~community/crm/activities/types/activityTypes";
import {
  toDateFieldValue,
  toMeetingEditPayload,
  toMeetingFormValues
} from "~community/crm/activities/utils/activityUtil";
import PropertyRow from "~community/crm/components/molecules/PropertyRow/PropertyRow";
import SidePanelActivityInfo from "~community/crm/components/molecules/SidePanelActivityInfo/SidePanelActivityInfo";
import SidePanelTimeField from "~community/crm/components/molecules/SidePanelTimeField/SidePanelTimeField";
import { useActivityAutoSave } from "~community/crm/hooks/useActivityAutoSave";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmLogMeetingFormValues,
  CrmMeetingEntity
} from "~community/crm/types/CrmCommonTypes";
import { updateCompanyRecord } from "~community/crm/utils/companyUtil";
import {
  getContactDisplayName,
  updateContactRecord
} from "~community/crm/utils/contactUtil";
import { getMeetingValidationSchema } from "~community/crm/utils/meetingValidations";

interface Props {
  meeting: CrmMeetingEntity;
  onSave: (payload: ActivityMeetingEditPayload) => void;
  onCompanyClick: (companyId: number) => void;
}

const SidePanelMeetingInfo: FC<Props> = ({
  meeting,
  onSave,
  onCompanyClick
}) => {
  const translateModule = useTranslator("crmModule");
  const translateText = useTranslator("crmModule", "activities");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "meetingSidePanel"
  );
  const translatePanelAria = useTranslator(
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
    validationSchema: getMeetingValidationSchema(translateModule),
    onSubmit: (values, { resetForm }) => {
      onSave(toMeetingEditPayload(meeting.id, values, formik.initialValues));
      resetForm({ values });
    }
  });

  useActivityAutoSave(formik);

  const { values, errors, setFieldValue } = formik;

  const noValue = translateText(["activitySidePanel", "info", "noValue"]);

  const handleDateChange = (date: Date): void => {
    setFieldValue("date", toDateFieldValue(date));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 border border-secondary-accent rounded-xl p-3">
        <p className="subtitle1">
          {translateText(["meetingSidePanel", "info", "attendees"])}
        </p>
        {meeting.contacts.length > 0 ? (
          <AvatarGroup
            ariaLabel={translateAria(["attendees"])}
            avatars={meeting.contacts.map((contact) => {
              const contactName = getContactDisplayName(contact);
              const [firstName, lastName] = contactName.split(" ");

              return {
                id: String(contact.id),
                firstName,
                lastName,
                title: contactName,
                size: "sm"
              };
            })}
          />
        ) : (
          <span className="body2">
            {translateText(["activitySidePanel", "info", "noLongerAvailable"])}
          </span>
        )}
      </div>

      <SidePanelActivityInfo
        id="meeting"
        date={
          values.date
            ? DateTime.fromISO(values.date)
            : DateTime.fromISO(meeting.meetingDate)
        }
        dateLabel={translateText(["activitySidePanel", "info", "date"])}
        {...(values.startTime && {
          startTime: DateTime.fromFormat(values.startTime, TIME_FORMAT_24_HOUR)
        })}
        secondaryRow={
          <PropertyRow
            label={translateText(["meetingSidePanel", "info", "endTime"])}
          >
            <SidePanelTimeField
              id="meeting-end-time"
              value={values.endTime}
              placeholder={noValue}
              ariaLabel={translatePanelAria(["editEndTime"])}
              {...(errors.endTime && { errorMessage: errors.endTime })}
              onChange={(time) => setFieldValue("endTime", time)}
            />
          </PropertyRow>
        }
        {...(values.ownerId && { owner: owners[values.ownerId] })}
        companyId={values.companyId}
        onCompanyClick={onCompanyClick}
        onDateChange={handleDateChange}
        onStartTimeChange={(time) => setFieldValue("startTime", time)}
        onOwnerChange={(ownerId) => setFieldValue("ownerId", ownerId)}
        onCompanyChange={(companyId) => setFieldValue("companyId", companyId)}
      />
    </div>
  );
};

export default SidePanelMeetingInfo;
