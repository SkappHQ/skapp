import {
  CalendarIcon,
  DatePicker,
  Dropdown,
  InputField,
  TextArea
} from "@rootcodelabs/skapp-ui";
import { APIProvider } from "@vis.gl/react-google-maps";
import { FormikProps } from "formik";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  getActivityTimeOptions,
  toDateFieldValue,
  toPickerDate
} from "~community/crm/activities/utils/activityUtil";
import ActivityOwnerField from "~community/crm/components/molecules/ActivityOwnerField/ActivityOwnerField";
import MeetingAttendeesField from "~community/crm/components/molecules/MeetingAttendeesField/MeetingAttendeesField";
import MeetingLocationField from "~community/crm/components/molecules/MeetingLocationField/MeetingLocationField";
import { CrmMeetingVenueEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmMeetingLocation,
  CrmScheduleMeetingFormValues
} from "~community/crm/types/CrmCommonTypes";
import { getContactCompanyIds } from "~community/crm/utils/contactUtil";

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

  const contacts = useCrmStore((state) => state.contacts);

  const attendeeCompanyIds = Array.from(
    new Set(getContactCompanyIds(contacts, values.contactIds))
  );

  const isInPerson = values.meetingVenue === CrmMeetingVenueEnum.IN_PERSON;

  const venueOptions = Object.values(CrmMeetingVenueEnum).map((venue) => ({
    id: venue,
    value: venue,
    label: translateText(["scheduleMeeting", "modal", "venues", venue])
  }));

  const pickedDate = values.date ? toPickerDate(values.date) : null;

  const handleDateSelect = (date?: Date): void => {
    setFieldValue("date", date ? toDateFieldValue(date) : null, true);
  };

  const handleVenueChange = (venue: CrmMeetingVenueEnum): void => {
    setFieldValue("meetingVenue", venue, true);
    if (venue === CrmMeetingVenueEnum.ONLINE) {
      setFieldValue("location", "", false);
      setFieldValue("locationUrl", "", false);
    }
  };

  const handleLocationTextChange = (text: string): void => {
    setFieldValue("location", text, false);
    setFieldValue("locationUrl", "", false);
  };

  const handlePlacePick = (picked: CrmMeetingLocation): void => {
    setFieldValue("location", picked.location, true);
    setFieldValue("locationUrl", picked.locationUrl, false);
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
              {...(touched.location &&
                errors.location && { errorMessage: errors.location })}
              onTextChange={handleLocationTextChange}
              onPlacePick={handlePlacePick}
              onBlur={() => setFieldTouched("location", true, true)}
            />
          </APIProvider>
        )}
        {isInPerson && !googleMapsApiKey && (
          <p className="text-sm text-[var(--color-semantic-red-text)]">
            {translateText([
              "scheduleMeeting",
              "modal",
              "location",
              "missingApiKey"
            ])}
          </p>
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

      <MeetingAttendeesField
        id="schedule-meeting-contactIds"
        formik={formik}
        isFromDifferentCompanies={attendeeCompanyIds.length > 1}
        onDealCleared={() => setFieldValue("dealId", null, false)}
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
    </div>
  );
};

export default ScheduleMeetingModalForm;
