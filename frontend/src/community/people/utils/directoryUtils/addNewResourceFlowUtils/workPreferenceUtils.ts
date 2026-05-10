export enum WorkSchedulePreference {
  FLEXIBLE = "flexible",
  FIXED = "fixed",
  SHIFT_BASED = "shift_based",
  COMPRESSED = "compressed"
}

export enum WorkLocationPreference {
  ONSITE = "onsite",
  REMOTE = "remote",
  HYBRID = "hybrid"
}

export interface WorkPreferences {
  workSchedule: WorkSchedulePreference | "";
  workLocation: WorkLocationPreference | "";
  preferredStartTime: string;
  notes: string;
}

export const DEFAULT_WORK_PREFERENCES: WorkPreferences = {
  workSchedule: "",
  workLocation: "",
  preferredStartTime: "",
  notes: ""
};

export const WORK_SCHEDULE_OPTIONS = [
  { label: "Flexible", value: WorkSchedulePreference.FLEXIBLE },
  { label: "Fixed", value: WorkSchedulePreference.FIXED },
  { label: "Shift Based", value: WorkSchedulePreference.SHIFT_BASED },
  { label: "Compressed Week", value: WorkSchedulePreference.COMPRESSED }
];

export const WORK_LOCATION_OPTIONS = [
  { label: "Onsite", value: WorkLocationPreference.ONSITE },
  { label: "Remote", value: WorkLocationPreference.REMOTE },
  { label: "Hybrid", value: WorkLocationPreference.HYBRID }
];

/**
 * Validates the preferred start time format (HH:mm)
 */
export const isValidTimeFormat = (time: string): boolean => {
  if (!time) return true;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
};

/**
 * Validates work preferences and returns error messages
 */
export const validateWorkPreferences = (
  preferences: WorkPreferences
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (
    preferences.preferredStartTime &&
    !isValidTimeFormat(preferences.preferredStartTime)
  ) {
    errors.preferredStartTime =
      "Invalid time format. Use HH:mm (e.g., 09:00)";
  }

  if (preferences.notes && preferences.notes.length > 500) {
    errors.notes = "Notes must be 500 characters or less";
  }

  return errors;
};

/**
 * Returns a human-readable label for the work schedule preference
 */
export const getWorkScheduleLabel = (
  schedule: WorkSchedulePreference | ""
): string => {
  const option = WORK_SCHEDULE_OPTIONS.find((opt) => opt.value === schedule);
  return option?.label ?? "";
};

/**
 * Returns a human-readable label for the work location preference
 */
export const getWorkLocationLabel = (
  location: WorkLocationPreference | ""
): string => {
  const option = WORK_LOCATION_OPTIONS.find((opt) => opt.value === location);
  return option?.label ?? "";
};

/**
 * Formats work preferences into a summary string for display
 */
export const formatWorkPreferencesSummary = (
  preferences: WorkPreferences
): string => {
  const parts: string[] = [];

  const scheduleLabel = getWorkScheduleLabel(preferences.workSchedule);
  if (scheduleLabel) parts.push(`Schedule: ${scheduleLabel}`);

  const locationLabel = getWorkLocationLabel(preferences.workLocation);
  if (locationLabel) parts.push(`Location: ${locationLabel}`);

  if (preferences.preferredStartTime) {
    parts.push(`Start: ${preferences.preferredStartTime}`);
  }

  return parts.join(" | ") || "No preferences set";
};

/**
 * Checks whether any work preference has been set
 */
export const hasWorkPreferences = (preferences: WorkPreferences): boolean => {
  return (
    preferences.workSchedule !== "" ||
    preferences.workLocation !== "" ||
    preferences.preferredStartTime !== "" ||
    preferences.notes !== ""
  );
};