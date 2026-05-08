import {
  WorkSchedulePreference,
  WorkLocationPreference,
  WorkPreferences,
  DEFAULT_WORK_PREFERENCES,
  WORK_SCHEDULE_OPTIONS,
  WORK_LOCATION_OPTIONS,
  isValidTimeFormat,
  validateWorkPreferences,
  getWorkScheduleLabel,
  getWorkLocationLabel,
  formatWorkPreferencesSummary,
  hasWorkPreferences
} from "./workPreferenceUtils";

describe("WorkSchedulePreference enum", () => {
  it("should have the correct values", () => {
    expect(WorkSchedulePreference.FLEXIBLE).toBe("flexible");
    expect(WorkSchedulePreference.FIXED).toBe("fixed");
    expect(WorkSchedulePreference.SHIFT_BASED).toBe("shift_based");
    expect(WorkSchedulePreference.COMPRESSED).toBe("compressed");
  });
});

describe("WorkLocationPreference enum", () => {
  it("should have the correct values", () => {
    expect(WorkLocationPreference.ONSITE).toBe("onsite");
    expect(WorkLocationPreference.REMOTE).toBe("remote");
    expect(WorkLocationPreference.HYBRID).toBe("hybrid");
  });
});

describe("DEFAULT_WORK_PREFERENCES", () => {
  it("should have all fields set to empty strings", () => {
    expect(DEFAULT_WORK_PREFERENCES).toEqual({
      workSchedule: "",
      workLocation: "",
      preferredStartTime: "",
      notes: ""
    });
  });
});

describe("WORK_SCHEDULE_OPTIONS", () => {
  it("should contain all schedule preferences with correct labels", () => {
    expect(WORK_SCHEDULE_OPTIONS).toEqual([
      { label: "Flexible", value: WorkSchedulePreference.FLEXIBLE },
      { label: "Fixed", value: WorkSchedulePreference.FIXED },
      { label: "Shift Based", value: WorkSchedulePreference.SHIFT_BASED },
      { label: "Compressed Week", value: WorkSchedulePreference.COMPRESSED }
    ]);
  });

  it("should have 4 options", () => {
    expect(WORK_SCHEDULE_OPTIONS).toHaveLength(4);
  });
});

describe("WORK_LOCATION_OPTIONS", () => {
  it("should contain all location preferences with correct labels", () => {
    expect(WORK_LOCATION_OPTIONS).toEqual([
      { label: "Onsite", value: WorkLocationPreference.ONSITE },
      { label: "Remote", value: WorkLocationPreference.REMOTE },
      { label: "Hybrid", value: WorkLocationPreference.HYBRID }
    ]);
  });

  it("should have 3 options", () => {
    expect(WORK_LOCATION_OPTIONS).toHaveLength(3);
  });
});

describe("isValidTimeFormat", () => {
  it("should return true when time is empty string", () => {
    expect(isValidTimeFormat("")).toBe(true);
  });

  it("should return true for valid time 09:00", () => {
    expect(isValidTimeFormat("09:00")).toBe(true);
  });

  it("should return true for valid time 00:00", () => {
    expect(isValidTimeFormat("00:00")).toBe(true);
  });

  it("should return true for valid time 23:59", () => {
    expect(isValidTimeFormat("23:59")).toBe(true);
  });

  it("should return true for valid time 12:30", () => {
    expect(isValidTimeFormat("12:30")).toBe(true);
  });

  it("should return true for valid time 19:45", () => {
    expect(isValidTimeFormat("19:45")).toBe(true);
  });

  it("should return false for hour 24:00", () => {
    expect(isValidTimeFormat("24:00")).toBe(false);
  });

  it("should return false for minute 60 like 12:60", () => {
    expect(isValidTimeFormat("12:60")).toBe(false);
  });

  it("should return false for single digit hour like 9:00", () => {
    expect(isValidTimeFormat("9:00")).toBe(false);
  });

  it("should return false for missing colon like 0900", () => {
    expect(isValidTimeFormat("0900")).toBe(false);
  });

  it("should return false for text input", () => {
    expect(isValidTimeFormat("abc")).toBe(false);
  });

  it("should return false for time with seconds like 09:00:00", () => {
    expect(isValidTimeFormat("09:00:00")).toBe(false);
  });

  it("should return false for negative time like -1:00", () => {
    expect(isValidTimeFormat("-1:00")).toBe(false);
  });

  it("should return false for 25:00", () => {
    expect(isValidTimeFormat("25:00")).toBe(false);
  });
});

describe("validateWorkPreferences", () => {
  const buildPreferences = (
    overrides: Partial<WorkPreferences> = {}
  ): WorkPreferences => ({
    ...DEFAULT_WORK_PREFERENCES,
    ...overrides
  });

  it("should return no errors for default preferences", () => {
    const errors = validateWorkPreferences(DEFAULT_WORK_PREFERENCES);
    expect(errors).toEqual({});
  });

  it("should return no errors when all fields are valid", () => {
    const prefs = buildPreferences({
      workSchedule: WorkSchedulePreference.FLEXIBLE,
      workLocation: WorkLocationPreference.REMOTE,
      preferredStartTime: "09:00",
      notes: "Some notes"
    });
    const errors = validateWorkPreferences(prefs);
    expect(errors).toEqual({});
  });

  it("should return error when preferredStartTime has invalid format", () => {
    const prefs = buildPreferences({ preferredStartTime: "25:00" });
    const errors = validateWorkPreferences(prefs);
    expect(errors.preferredStartTime).toBe(
      "Invalid time format. Use HH:mm (e.g., 09:00)"
    );
  });

  it("should return error when notes exceed 500 characters", () => {
    const prefs = buildPreferences({ notes: "a".repeat(501) });
    const errors = validateWorkPreferences(prefs);
    expect(errors.notes).toBe("Notes must be 500 characters or less");
  });

  it("should not return error when notes are exactly 500 characters", () => {
    const prefs = buildPreferences({ notes: "a".repeat(500) });
    const errors = validateWorkPreferences(prefs);
    expect(errors.notes).toBeUndefined();
  });

  it("should return multiple errors when both time and notes are invalid", () => {
    const prefs = buildPreferences({
      preferredStartTime: "bad",
      notes: "x".repeat(501)
    });
    const errors = validateWorkPreferences(prefs);
    expect(Object.keys(errors)).toHaveLength(2);
    expect(errors.preferredStartTime).toBeDefined();
    expect(errors.notes).toBeDefined();
  });

  it("should not return error when preferredStartTime is empty", () => {
    const prefs = buildPreferences({ preferredStartTime: "" });
    const errors = validateWorkPreferences(prefs);
    expect(errors.preferredStartTime).toBeUndefined();
  });

  it("should not return error when notes is empty", () => {
    const prefs = buildPreferences({ notes: "" });
    const errors = validateWorkPreferences(prefs);
    expect(errors.notes).toBeUndefined();
  });
});

describe("getWorkScheduleLabel", () => {
  it("should return 'Flexible' for FLEXIBLE", () => {
    expect(getWorkScheduleLabel(WorkSchedulePreference.FLEXIBLE)).toBe(
      "Flexible"
    );
  });

  it("should return 'Fixed' for FIXED", () => {
    expect(getWorkScheduleLabel(WorkSchedulePreference.FIXED)).toBe("Fixed");
  });

  it("should return 'Shift Based' for SHIFT_BASED", () => {
    expect(getWorkScheduleLabel(WorkSchedulePreference.SHIFT_BASED)).toBe(
      "Shift Based"
    );
  });

  it("should return 'Compressed Week' for COMPRESSED", () => {
    expect(getWorkScheduleLabel(WorkSchedulePreference.COMPRESSED)).toBe(
      "Compressed Week"
    );
  });

  it("should return empty string for empty string input", () => {
    expect(getWorkScheduleLabel("")).toBe("");
  });
});

describe("getWorkLocationLabel", () => {
  it("should return 'Onsite' for ONSITE", () => {
    expect(getWorkLocationLabel(WorkLocationPreference.ONSITE)).toBe("Onsite");
  });

  it("should return 'Remote' for REMOTE", () => {
    expect(getWorkLocationLabel(WorkLocationPreference.REMOTE)).toBe("Remote");
  });

  it("should return 'Hybrid' for HYBRID", () => {
    expect(getWorkLocationLabel(WorkLocationPreference.HYBRID)).toBe("Hybrid");
  });

  it("should return empty string for empty string input", () => {
    expect(getWorkLocationLabel("")).toBe("");
  });
});

describe("formatWorkPreferencesSummary", () => {
  const buildPreferences = (
    overrides: Partial<WorkPreferences> = {}
  ): WorkPreferences => ({
    ...DEFAULT_WORK_PREFERENCES,
    ...overrides
  });

  it("should return 'No preferences set' when all fields are empty", () => {
    expect(formatWorkPreferencesSummary(DEFAULT_WORK_PREFERENCES)).toBe(
      "No preferences set"
    );
  });

  it("should include schedule label when workSchedule is set", () => {
    const prefs = buildPreferences({
      workSchedule: WorkSchedulePreference.FLEXIBLE
    });
    expect(formatWorkPreferencesSummary(prefs)).toBe("Schedule: Flexible");
  });

  it("should include location label when workLocation is set", () => {
    const prefs = buildPreferences({
      workLocation: WorkLocationPreference.REMOTE
    });
    expect(formatWorkPreferencesSummary(prefs)).toBe("Location: Remote");
  });

  it("should include start time when preferredStartTime is set", () => {
    const prefs = buildPreferences({ preferredStartTime: "09:00" });
    expect(formatWorkPreferencesSummary(prefs)).toBe("Start: 09:00");
  });

  it("should join multiple parts with pipe separator", () => {
    const prefs = buildPreferences({
      workSchedule: WorkSchedulePreference.FIXED,
      workLocation: WorkLocationPreference.ONSITE,
      preferredStartTime: "08:30"
    });
    expect(formatWorkPreferencesSummary(prefs)).toBe(
      "Schedule: Fixed | Location: Onsite | Start: 08:30"
    );
  });

  it("should not include notes in the summary", () => {
    const prefs = buildPreferences({ notes: "Important notes here" });
    expect(formatWorkPreferencesSummary(prefs)).toBe("No preferences set");
  });

  it("should handle schedule and start time without location", () => {
    const prefs = buildPreferences({
      workSchedule: WorkSchedulePreference.COMPRESSED,
      preferredStartTime: "07:00"
    });
    expect(formatWorkPreferencesSummary(prefs)).toBe(
      "Schedule: Compressed Week | Start: 07:00"
    );
  });
});

describe("hasWorkPreferences", () => {
  it("should return false when all fields are empty", () => {
    expect(hasWorkPreferences(DEFAULT_WORK_PREFERENCES)).toBe(false);
  });

  it("should return true when only workSchedule is set", () => {
    const prefs: WorkPreferences = {
      ...DEFAULT_WORK_PREFERENCES,
      workSchedule: WorkSchedulePreference.FLEXIBLE
    };
    expect(hasWorkPreferences(prefs)).toBe(true);
  });

  it("should return true when only workLocation is set", () => {
    const prefs: WorkPreferences = {
      ...DEFAULT_WORK_PREFERENCES,
      workLocation: WorkLocationPreference.HYBRID
    };
    expect(hasWorkPreferences(prefs)).toBe(true);
  });

  it("should return true when only preferredStartTime is set", () => {
    const prefs: WorkPreferences = {
      ...DEFAULT_WORK_PREFERENCES,
      preferredStartTime: "09:00"
    };
    expect(hasWorkPreferences(prefs)).toBe(true);
  });

  it("should return true when only notes is set", () => {
    const prefs: WorkPreferences = {
      ...DEFAULT_WORK_PREFERENCES,
      notes: "Some notes"
    };
    expect(hasWorkPreferences(prefs)).toBe(true);
  });

  it("should return true when all fields are set", () => {
    const prefs: WorkPreferences = {
      workSchedule: WorkSchedulePreference.FIXED,
      workLocation: WorkLocationPreference.ONSITE,
      preferredStartTime: "08:00",
      notes: "Notes"
    };
    expect(hasWorkPreferences(prefs)).toBe(true);
  });
});
