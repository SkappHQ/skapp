import {
  CalendarIcon,
  DatePicker,
  Dropdown,
  InputField,
  TextArea
} from "@rootcodelabs/skapp-ui";
import { APIProvider } from "@vis.gl/react-google-maps";
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
import MeetingLocationField from "~community/crm/components/molecules/MeetingLocationField/MeetingLocationField";
import { CrmMeetingVenueEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmContactEntity,
  CrmMeetingLocation,
  CrmScheduleMeetingFormValues
} from "~community/crm/types/CrmCommonTypes";
import {
  getContactCompanyIds,
  getContactDisplayName
} from "~community/crm/utils/contactUtil";
import { isDealMatchingContacts } from "~community/crm/utils/dealUtil";

interface Props {
  formik: FormikProps<CrmScheduleMeetingFormValues>;
}

const ScheduleMeetingModalForm: FC<Props> = ({ formik }) => {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldTouched
  } = formik;

  const translateText = useTranslator("crmModule", "activities");
  const translateAria = useTranslator(
    "crmAria",
    "activities",
    "logMeeting",
    "modal"
  );
  const translateScheduleAria = useTranslator(
    "crmAria",
    "activities",
    "scheduleMeeting",
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

  const isInPerson = values.meetingVenue === CrmMeetingVenueEnum.IN_PERSON;

  const venueOptions = Object.values(CrmMeetingVenueEnum).map((venue) => ({
    id: venue,
    value: venue,
    label: translateText(["scheduleMeeting", "modal", "venues", venue])
  }));

  const pickedDate = values.date ? toPickerDate(values.date) : null;

  const locationErrorMessage = touched.location && errors.location;

  const handleDateSelect = (date?: Date): void => {
    setFieldValue("date", date ? toDateFieldValue(date) : null, true);
  };

  const handleVenueChange = (venue: CrmMeetingVenueEnum): void => {
    setFieldValue("meetingVenue", venue, true);
    if (venue === CrmMeetingVenueEnum.ONLINE) {
      setFieldValue("location", "", false);
      setFieldValue("locationAddress", "", false);
      setFieldValue("locationUrl", "", false);
    }
  };

  const handleLocationTextChange = (text: string): void => {
    setFieldValue("location", text, false);
    setFieldValue("locationAddress", "", false);
    setFieldValue("locationUrl", "", false);
  };

  const handlePlacePick = (picked: CrmMeetingLocation): void => {
    setFieldValue("location", picked.location, true);
    setFieldValue("locationAddress", picked.locationAddress, false);
    setFieldValue("locationUrl", picked.locationUrl, false);
  };

  const handleLocationBlur = (): void => {
    setFieldTouched("location", true, true);
  };

  return (
    <div className="flex flex-col gap-2 overflow-y-auto pr-1">
      <InputField
        id="schedule-meeting-subject-input"
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

      <div className="flex flex-row items-start gap-[0.625rem]">
        <div className="flex-1">
          <DatePicker
            mode="single"
            {...(pickedDate && { selected: pickedDate })}
            onSelect={handleDateSelect}
            popperProps={{ position: "bottom-start", isFlip: true }}
          >
            <div>
              <InputField
                id="schedule-meeting-date-input"
                name="date"
                value={pickedDate ? pickedDate.toLocaleDateString() : ""}
                label={translateText(["logActivity", "labels", "date"])}
                placeholder={translateText([
                  "logActivity",
                  "placeholders",
                  "date"
                ])}
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
        </div>
        <div className="flex-1">
          <Dropdown
            id="schedule-meeting-venue-input"
            options={venueOptions}
            value={values.meetingVenue}
            onChange={(value) =>
              handleVenueChange(value as CrmMeetingVenueEnum)
            }
            label={translateText([
              "scheduleMeeting",
              "modal",
              "labels",
              "venue"
            ])}
            placeholder={translateText([
              "scheduleMeeting",
              "modal",
              "placeholders",
              "venue"
            ])}
            variant="primary"
            className="rounded-lg"
            ariaLabel={translateScheduleAria(["venue"])}
            width="100%"
            required
          />
        </div>
      </div>

      <div className="flex flex-row items-start gap-[0.625rem]">
        <div className="flex-1">
          <Dropdown
            id="schedule-meeting-startTime-input"
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
            id="schedule-meeting-endTime-input"
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

      <div aria-live="polite">
        {isInPerson && googleMapsApiKey && (
          <APIProvider apiKey={googleMapsApiKey}>
            <MeetingLocationField
              id="schedule-meeting-location-input"
              value={values.location}
              {...(locationErrorMessage && {
                errorMessage: locationErrorMessage
              })}
              onTextChange={handleLocationTextChange}
              onPlacePick={handlePlacePick}
              onBlur={handleLocationBlur}
            />
          </APIProvider>
        )}
        {isInPerson && !googleMapsApiKey && (
          <InputField
            id="schedule-meeting-location-input"
            name="location"
            value={values.location}
            label={translateText([
              "scheduleMeeting",
              "modal",
              "labels",
              "location"
            ])}
            placeholder={translateText([
              "scheduleMeeting",
              "modal",
              "placeholders",
              "location"
            ])}
            {...(locationErrorMessage && {
              errorMessage: locationErrorMessage
            })}
            state={locationErrorMessage ? "error" : "default"}
            onChange={(event) => handleLocationTextChange(event.target.value)}
            onBlur={handleLocationBlur}
            aria-label={translateScheduleAria(["location"])}
            fullWidth
            required
          />
        )}
        {isInPerson && values.locationUrl && (
          <a
            href={values.locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-sm underline"
          >
            {translateText([
              "scheduleMeeting",
              "modal",
              "location",
              "openInMaps"
            ])}
          </a>
        )}
      </div>

      <ActivityContactsField
        id="schedule-meeting-contactIds"
        formik={formik}
        name="contactIds"
        label={translateText(["logMeeting", "modal", "labels", "attendees"])}
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

      <ActivityOwnerField id="schedule-meeting-ownerId" formik={formik} />

      <TextArea
        name="comments"
        value={values.comments}
        label={translateText(["logActivity", "labels", "comments"])}
        placeholder={translateText(["logActivity", "placeholders", "comments"])}
        onChange={handleChange}
        rows={3}
        aria-label={translateAria(["comments"])}
      />

      <ActivityAssociations
        isForcedOpen={isDealClearedNoticeVisible || isDealMismatch}
      >
        <ActivityDealField
          id="schedule-meeting-deal"
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
          id="schedule-meeting-related-to"
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

export default ScheduleMeetingModalForm;
