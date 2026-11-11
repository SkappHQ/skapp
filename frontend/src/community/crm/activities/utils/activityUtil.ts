import { DateTime, Interval } from "luxon";

import {
  TIME_FORMAT_12_HOUR_PADDED,
  TIME_FORMAT_24_HOUR
} from "~community/common/constants/timeConstants";
import { ACTIVITY_TIME_SLOT_MINUTES } from "~community/crm/activities/constants/activityConstants";
import {
  ActivityCallEditPayload,
  ActivityLinkEditPayload,
  ActivityMeetingEditPayload,
  ActivityTaskEditPayload
} from "~community/crm/activities/types/activityTypes";
import {
  CrmActivityTaskEntity,
  CrmAddTaskFormValues,
  CrmCallEntity,
  CrmLogCallFormValues,
  CrmLogMeetingFormValues,
  CrmMeetingEntity
} from "~community/crm/types/CrmCommonTypes";
import { formatCallDuration } from "~community/crm/utils/callUtil";

export const getTimeSlotStart = (dateTime: DateTime): DateTime =>
  dateTime.set({
    minute: dateTime.minute - (dateTime.minute % ACTIVITY_TIME_SLOT_MINUTES)
  });

export const getActivityEndTimeSlot = (slotStart: DateTime): DateTime =>
  DateTime.min(
    slotStart.plus({ hours: 1 }),
    getTimeSlotStart(slotStart.endOf("day"))
  );

export const getActivityTimeOptions = () => {
  const dayStart = DateTime.utc().startOf("day");

  return Interval.fromDateTimes(dayStart, dayStart.plus({ days: 1 }))
    .splitBy({ minutes: ACTIVITY_TIME_SLOT_MINUTES })
    .map(({ start }) => {
      const value = start!.toFormat(TIME_FORMAT_24_HOUR);

      return {
        id: value,
        value,
        label: start!.toFormat(TIME_FORMAT_12_HOUR_PADDED)
      };
    });
};

export const toPickerDate = (isoDate: string): Date =>
  DateTime.fromISO(isoDate).startOf("day").toJSDate();

export const toDateFieldValue = (date: Date): string | null =>
  DateTime.fromJSDate(date).startOf("day").toUTC().toISO();

export const toActivityInstant = (
  isoDate: string,
  time: string
): string | null => {
  const { hour, minute } = DateTime.fromFormat(time, TIME_FORMAT_24_HOUR);

  return DateTime.fromISO(isoDate)
    .set({ hour, minute })
    .startOf("minute")
    .toUTC()
    .toISO();
};

interface ActivityLinkFormValues {
  ownerId: number | null;
}

const toLinkEditPayload = (
  values: ActivityLinkFormValues,
  saved: ActivityLinkFormValues
): ActivityLinkEditPayload => ({
  ...(values.ownerId &&
    values.ownerId !== saved.ownerId && { ownerId: values.ownerId })
});

const toTimeFieldValue = (isoDateTime: string): string =>
  DateTime.fromISO(isoDateTime).toFormat(TIME_FORMAT_24_HOUR);

export const toCallFormValues = (
  call: CrmCallEntity
): CrmLogCallFormValues => ({
  subject: call.subject,
  date: DateTime.fromISO(call.loggedAt).startOf("day").toUTC().toISO(),
  time: toTimeFieldValue(call.loggedAt),
  duration:
    call.durationMinutes != null
      ? formatCallDuration(call.durationMinutes)
      : "",
  contactId: call.contact?.id ?? null,
  ownerId: call.ownerId,
  comments: call.comments ?? "",
  dealId: call.deal?.id ?? null,
  companyId: call.company?.id ?? null
});

export const toCallEditPayload = (
  id: number,
  values: CrmLogCallFormValues,
  saved: CrmLogCallFormValues
): ActivityCallEditPayload => ({
  id,
  ...toLinkEditPayload(values, saved),
  ...((values.date !== saved.date || values.time !== saved.time) &&
    values.date && {
      loggedAt: toActivityInstant(values.date, values.time)
    })
});

export const toMeetingFormValues = (
  meeting: CrmMeetingEntity
): CrmLogMeetingFormValues => ({
  subject: meeting.name,
  date: DateTime.fromISO(meeting.meetingDate).startOf("day").toUTC().toISO(),
  startTime: meeting.startAt ? toTimeFieldValue(meeting.startAt) : "",
  endTime: meeting.endAt ? toTimeFieldValue(meeting.endAt) : "",
  contactIds: meeting.contacts.flatMap((contact) =>
    contact.id ? [contact.id] : []
  ),
  ownerId: meeting.ownerId,
  comments: meeting.comments ?? "",
  dealId: meeting.deal?.id ?? null,
  companyId: meeting.company?.id ?? null
});

export const toMeetingEditPayload = (
  id: number,
  values: CrmLogMeetingFormValues,
  saved: CrmLogMeetingFormValues
): ActivityMeetingEditPayload => {
  const isDateChanged = values.date !== saved.date;

  return {
    id,
    ...toLinkEditPayload(values, saved),
    ...(isDateChanged &&
      values.date && {
        meetingDate: DateTime.fromISO(values.date).toISODate()
      }),
    ...((isDateChanged || values.startTime !== saved.startTime) &&
      values.date &&
      values.startTime && {
        startAt: toActivityInstant(values.date, values.startTime)
      }),
    ...((isDateChanged || values.endTime !== saved.endTime) &&
      values.date &&
      values.endTime && {
        endAt: toActivityInstant(values.date, values.endTime)
      })
  };
};

export const toActivityTaskFormValues = (
  task: CrmActivityTaskEntity
): CrmAddTaskFormValues => ({
  name: task.name,
  priority: task.priority,
  dueAt: task.dueAt,
  ownerId: task.ownerId,
  contactId: task.contact?.id ?? null,
  dealId: task.deal?.id ?? null,
  companyId: task.company?.id ?? null,
  notes: task.notes ?? ""
});

export const toActivityTaskEditPayload = (
  id: number,
  values: CrmAddTaskFormValues,
  saved: CrmAddTaskFormValues
): ActivityTaskEditPayload => ({
  id,
  ...toLinkEditPayload(values, saved),
  ...(values.priority !== saved.priority && { priority: values.priority }),
  ...(values.dueAt !== saved.dueAt && { dueAt: values.dueAt })
});
