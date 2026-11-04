import {
  CalendarIcon,
  DatePicker,
  Dropdown,
  InputField,
  TextArea
} from "@rootcodelabs/skapp-ui";
import { FormikProps } from "formik";
import { FC, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  getActivityTimeOptions,
  toDateFieldValue,
  toPickerDate
} from "~community/crm/activities/utils/activityUtil";
import ActivityAssociations from "~community/crm/components/molecules/ActivityAssociations/ActivityAssociations";
import ActivityDealField from "~community/crm/components/molecules/ActivityDealField/ActivityDealField";
import ActivityOwnerField from "~community/crm/components/molecules/ActivityOwnerField/ActivityOwnerField";
import ActivityRelatedToField from "~community/crm/components/molecules/ActivityRelatedToField/ActivityRelatedToField";
import MeetingAttendeesField from "~community/crm/components/molecules/MeetingAttendeesField/MeetingAttendeesField";
import { useCrmStore } from "~community/crm/store/store";
import { CrmLogMeetingFormValues } from "~community/crm/types/CrmCommonTypes";
import {
  getContactCompanyIds,
  getContactDisplayName
} from "~community/crm/utils/contactUtil";
import { isDealMatchingContacts } from "~community/crm/utils/dealUtil";

interface Props {
  formik: FormikProps<CrmLogMeetingFormValues>;
}

const LogMeetingModalForm: FC<Props> = ({ formik }) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  const translateText = useTranslator("crmModule", "activities");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "logMeeting",
    "modal"
  );

  const { contacts, deals } = useCrmStore(
    useShallow((store) => ({
      contacts: store.contacts,
      deals: store.deals
    }))
  );

  const [isDealClearedNoticeVisible, setIsDealClearedNoticeVisible] =
    useState(false);

  const attendees = values.contactIds.map((contactId) => contacts[contactId]);

  const attendeeCompanyIds = Array.from(
    new Set(getContactCompanyIds(contacts, values.contactIds))
  );

  const isDealMismatch = Boolean(
    values.dealId &&
    attendees.length > 0 &&
    !isDealMatchingContacts(deals[values.dealId], attendees)
  );

  const primaryAttendee = attendees.length > 0 ? attendees[0] : null;

  const isCompanyMismatch = Boolean(
    values.companyId &&
    primaryAttendee &&
    values.companyId !== primaryAttendee.companyId
  );

  const handleDealCleared = (): void => {
    setFieldValue("dealId", null);
    setIsDealClearedNoticeVisible(true);
  };

  const handleDealChange = (dealId: number | null): void => {
    setFieldValue("dealId", dealId);
    setIsDealClearedNoticeVisible(false);
  };

  const pickedDate = values.date ? toPickerDate(values.date) : null;

  const handleDateSelect = (date?: Date): void => {
    setFieldValue("date", date ? toDateFieldValue(date) : null, true);
  };

  return (
    <div className="flex flex-col gap-2 overflow-y-auto pr-1">
      <InputField
        id="log-meeting-subject-input"
        name="subject"
        value={values.subject}
        label={translateText(["logActivity", "labels", "subject"])}
        placeholder={translateText(["logActivity", "placeholders", "subject"])}
        {...(touched.subject && { errorMessage: errors.subject })}
        state={touched.subject && errors.subject ? "error" : "default"}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-label={translateAria(["subject"])}
        fullWidth
        required
      />

      <DatePicker
        mode="single"
        {...(pickedDate && { selected: pickedDate })}
        onSelect={handleDateSelect}
        popperProps={{ position: "bottom-start", isFlip: true }}
      >
        <div>
          <InputField
            id="log-meeting-date-input"
            name="date"
            value={pickedDate ? pickedDate.toLocaleDateString() : ""}
            label={translateText(["logActivity", "labels", "date"])}
            placeholder={translateText(["logActivity", "placeholders", "date"])}
            errorMessage={errors.date}
            state={errors.date ? "error" : "default"}
            aria-label={translateAria(["date"])}
            rightIcon={<CalendarIcon />}
            fullWidth
            readOnly
            required
          />
        </div>
      </DatePicker>

      <div className="flex flex-row items-start gap-[0.625rem]">
        <div className="flex-1">
          <Dropdown
            id="log-meeting-startTime-input"
            options={getActivityTimeOptions()}
            value={values.startTime}
            onChange={(value) => setFieldValue("startTime", value, true)}
            label={translateText([
              "logMeeting",
              "modal",
              "labels",
              "startTime"
            ])}
            placeholder={translateText(["logActivity", "placeholders", "time"])}
            variant="primary"
            className="rounded-lg"
            ariaLabel={translateAria(["startTime"])}
            width="100%"
            scrollToSelected
          />
        </div>
        <div className="flex-1">
          <Dropdown
            id="log-meeting-endTime-input"
            options={getActivityTimeOptions()}
            value={values.endTime}
            onChange={(value) => setFieldValue("endTime", value, true)}
            label={translateText(["logMeeting", "modal", "labels", "endTime"])}
            placeholder={translateText(["logActivity", "placeholders", "time"])}
            variant={errors.endTime ? "primary-error" : "primary"}
            errorMessage={errors.endTime}
            className="rounded-lg"
            ariaLabel={translateAria(["endTime"])}
            width="100%"
            scrollToSelected
          />
        </div>
      </div>

      <div className="flex flex-row items-start gap-[0.625rem]">
        <div className="flex-1 min-w-0">
          <MeetingAttendeesField
            id="log-meeting-contactIds"
            contactIds={values.contactIds}
            dealId={values.dealId}
            {...(touched.contactIds &&
              errors.contactIds && { errorMessage: String(errors.contactIds) })}
            onChange={(contactIds) =>
              setFieldValue("contactIds", contactIds, true)
            }
            isFromDifferentCompanies={attendeeCompanyIds.length > 1}
            onDealCleared={handleDealCleared}
          />
        </div>
        <div className="flex-1">
          <ActivityOwnerField
            id="log-meeting-ownerId"
            ownerId={values.ownerId}
            errorMessage={errors.ownerId}
            onChange={(ownerId) => setFieldValue("ownerId", ownerId)}
          />
        </div>
      </div>

      <TextArea
        name="comments"
        value={values.comments}
        label={translateText(["logActivity", "labels", "comments"])}
        placeholder={translateText(["logActivity", "placeholders", "comments"])}
        onChange={handleChange}
        rows={2}
        aria-label={translateAria(["comments"])}
      />

      <ActivityAssociations
        isForcedOpen={isDealClearedNoticeVisible || isDealMismatch}
      >
        <ActivityDealField
          id="log-meeting-deal"
          dealId={values.dealId}
          fieldAriaLabel={translateAria(["deal"])}
          clearedNoticeText={translateText([
            "logMeeting",
            "modal",
            "notices",
            "dealCleared"
          ])}
          isClearedNoticeVisible={isDealClearedNoticeVisible}
          onChange={handleDealChange}
          {...(attendeeCompanyIds.length === 1 && {
            filterCompanyId: attendeeCompanyIds[0]
          })}
          {...(isDealMismatch && {
            errorMessage: translateText([
              "logActivity",
              "validations",
              "dealMismatch"
            ])
          })}
        />
        <ActivityRelatedToField
          id="log-meeting-related-to"
          companyId={values.companyId}
          fieldAriaLabel={translateAria(["relatedTo"])}
          onChange={(companyId) => setFieldValue("companyId", companyId)}
          {...(isCompanyMismatch &&
            primaryAttendee && {
              mismatchTooltip: translateText(
                ["logActivity", "tooltips", "relatedToMismatch"],
                { name: getContactDisplayName(primaryAttendee) }
              )
            })}
        />
      </ActivityAssociations>
    </div>
  );
};

export default LogMeetingModalForm;
