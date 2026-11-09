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
import ActivityContactsField from "~community/crm/components/molecules/ActivityContactsField/ActivityContactsField";
import ActivityDealField from "~community/crm/components/molecules/ActivityDealField/ActivityDealField";
import ActivityOwnerField from "~community/crm/components/molecules/ActivityOwnerField/ActivityOwnerField";
import ActivityRelatedToField from "~community/crm/components/molecules/ActivityRelatedToField/ActivityRelatedToField";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactEntity,
  CrmLogMeetingFormValues
} from "~community/crm/types/CrmCommonTypes";
import {
  getContactCompanyIds,
  getContactDisplayName
} from "~community/crm/utils/contactUtil";
import { isDealMatchingContacts } from "~community/crm/utils/dealUtil";

interface Props {
  formik: FormikProps<CrmLogMeetingFormValues>;
  isDetailsOnly?: boolean;
}

const LogMeetingModalForm: FC<Props> = ({ formik, isDetailsOnly = false }) => {
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

  const handleAttendeesChange = (nextAttendees: CrmContactEntity[]): void => {
    const selectedDeal = values.dealId ? deals[values.dealId] : null;

    const isDealUnmatched =
      selectedDeal &&
      nextAttendees.length > 0 &&
      isDealMatchingContacts(selectedDeal, attendees) &&
      !isDealMatchingContacts(selectedDeal, nextAttendees);

    if (isDealUnmatched) {
      setFieldValue("dealId", null);
      setIsDealClearedNoticeVisible(true);
    }
  };

  const primaryAttendee = attendees.length > 0 ? attendees[0] : null;

  const isCompanyMismatch = Boolean(
    values.companyId &&
    primaryAttendee &&
    values.companyId !== primaryAttendee.companyId
  );

  const pickedDate = values.date ? toPickerDate(values.date) : null;

  const handleDateSelect = (date?: Date): void => {
    setFieldValue("date", date ? toDateFieldValue(date) : null, true);
  };

  return (
    <div className="flex flex-col gap-2 overflow-y-auto pr-1">
      {!isDetailsOnly && (
        <InputField
          id="log-meeting-subject-input"
          name="subject"
          value={values.subject}
          label={translateText(["logActivity", "labels", "subject"])}
          placeholder={translateText([
            "logActivity",
            "placeholders",
            "subject"
          ])}
          {...(touched.subject && { errorMessage: errors.subject })}
          state={touched.subject && errors.subject ? "error" : "default"}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-label={translateAria(["subject"])}
          fullWidth
          required
        />
      )}

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
          <ActivityContactsField
            id="log-meeting-contactIds"
            formik={formik}
            name="contactIds"
            label={translateText([
              "logMeeting",
              "modal",
              "labels",
              "attendees"
            ])}
            placeholder={translateText([
              "logMeeting",
              "modal",
              "placeholders",
              "attendees"
            ])}
            groupAriaLabel={translateAria(["attendees"])}
            fillsRelatedTo
            {...(attendeeCompanyIds.length > 1 && {
              warningTooltip: translateText([
                "logMeeting",
                "modal",
                "tooltips",
                "differentCompanies"
              ])
            })}
            onContactsChange={handleAttendeesChange}
            required
          />
        </div>
        <div className="flex-1">
          <ActivityOwnerField id="log-meeting-ownerId" formik={formik} />
        </div>
      </div>

      {!isDetailsOnly && (
        <TextArea
          name="comments"
          value={values.comments}
          label={translateText(["logActivity", "labels", "comments"])}
          placeholder={translateText([
            "logActivity",
            "placeholders",
            "comments"
          ])}
          onChange={handleChange}
          rows={2}
          aria-label={translateAria(["comments"])}
        />
      )}

      <ActivityAssociations
        isForcedOpen={isDealClearedNoticeVisible || isDealMismatch}
      >
        <ActivityDealField
          id="log-meeting-deal"
          formik={formik}
          fieldAriaLabel={translateAria(["deal"])}
          isClearedNoticeVisible={isDealClearedNoticeVisible}
          isMismatch={isDealMismatch}
          onDealChange={() => setIsDealClearedNoticeVisible(false)}
          {...(attendeeCompanyIds.length === 1 && {
            filterCompanyId: attendeeCompanyIds[0]
          })}
        />
        <ActivityRelatedToField
          id="log-meeting-related-to"
          formik={formik}
          fieldAriaLabel={translateAria(["relatedTo"])}
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
