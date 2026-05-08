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

describe("workPreferenceUtils", () => {
  describe("DEFAULT_WORK_PREFERENCES", () => {
    it("should have all fields as empty strings", () => {
      expect(DEFAULT_WORK_PREFERENCES).toEqual({
        workSchedule: "",
        workLocation: "",
        preferredStartTime: "",
        notes: ""
      });
    });
  });

  describe("WORK_SCHEDULE_OPTIONS", () => {
    it("should contain all schedule preference values", () => {
      const values = WORK_SCHEDULE_OPTIONS.map((opt) => opt.value);
      expect(values).toContain(WorkSchedulePreference.FLEXIBLE);
      expect(values).toContain(WorkSchedulePreference.FIXED);
      expect(values).toContain(WorkSchedulePreference.SHIFT_BASED);
      expect(values).toContain(WorkSchedulePreference.COMPRESSED);
    });

    it("should have 4 options", () => {
      expect(WORK_SCHEDULE_OPTIONS).toHaveLength(4);
    });
  });

  describe("WORK_LOCATION_OPTIONS", () => {
    it("should contain all location preference values", () => {
      const values = WORK_LOCATION_OPTIONS.map((opt) => opt.value);
      expect(values).toContain(WorkLocationPreference.ONSITE);
      expect(values).toContain(WorkLocationPreference.REMOTE);
      expect(values).toContain(WorkLocationPreference.HYBRID);
    });

    it("should have 3 options", () => {
      expect(WORK_LOCATION_OPTIONS).toHaveLength(3);
    });
  });

  describe("isValidTimeFormat", () => {
    it("should return true for empty string", () => {
      expect(isValidTimeFormat("")).toBe(true);
    });

    it("should return true for valid time 09:00", () => {
      expect(isValidTimeFormat("09:00")).toBe(true);
    });

    it("should return true for valid time 23:59", () => {
      expect(isValidTimeFormat("23:59")).toBe(true);
    });

    it("should return true for valid time 00:00", () => {
      expect(isValidTimeFormat("00:00")).toBe(true);
    });

    it("should return true for valid time 19:30", () => {
      expect(isValidTimeFormat("19:30")).toBe(true);
    });

    it("should return false for invalid hour 24:00", () => {
      expect(isValidTimeFormat("24:00")).toBe(false);
    });

    it("should return false for invalid minute 12:60", () => {
      expect(isValidTimeFormat("12:60")).toBe(false);
    });

    it("should return false for single digit hour 9:00", () => {
      expect(isValidTimeFormat("9:00")).toBe(false);
    });

    it("should return false for missing colon", () => {
      expect(isValidTimeFormat("0900")).toBe(false);
    });

    it("should return false for random string", () => {
      expect(isValidTimeFormat("abc")).toBe(false);
    });

    it("should return false for time with seconds 09:00:00", () => {
      expect(isValidTimeFormat("09:00:00")).toBe(false);
    });

    it("should return false for 25:00", () => {
      expect(isValidTimeFormat("25:00")).toBe(false);
    });
  });

  describe("validateWorkPreferences", () => {
    it("should return no errors for valid preferences", () => {
      const prefs: WorkPreferences = {
        workSchedule: WorkSchedulePreference.FLEXIBLE,
        workLocation: WorkLocationPreference.REMOTE,
        preferredStartTime: "09:00",
        notes: "Some notes"
      };
      expect(validateWorkPreferences(prefs)).toEqual({});
    });

    it("should return no errors for default empty preferences", () => {
      expect(validateWorkPreferences(DEFAULT_WORK_PREFERENCES)).toEqual({});
    });

    it("should return error for invalid time format", () => {
      const prefs: WorkPreferences = {
        workSchedule: "",
        workLocation: "",
        preferredStartTime: "25:00",
        notes: ""
      };
      const errors = validateWorkPreferences(prefs);
      expect(errors.preferredStartTime).toBe(
        "Invalid time format. Use HH:mm (e.g., 09:00)"
      );
    });

    it("should return error when notes exceed 500 characters", () => {
      const prefs: WorkPreferences = {
        workSchedule: "",
        workLocation: "",
        preferredStartTime: "",
        notes: "a".repeat(501)
      };
      const errors = validateWorkPreferences(prefs);
      expect(errors.notes).toBe("Notes must be 500 characters or less");
    });

    it("should not return error when notes are exactly 500 characters", () => {
      const prefs: WorkPreferences = {
        workSchedule: "",
        workLocation: "",
        preferredStartTime: "",
        notes: "a".repeat(500)
      };
      const errors = validateWorkPreferences(prefs);
      expect(errors.notes).toBeUndefined();
    });

    it("should return multiple errors when both time and notes are invalid", () => {
      const prefs: WorkPreferences = {
        workSchedule: "",
        workLocation: "",
        preferredStartTime: "invalid",
        notes: "a".repeat(501)
      };
      const errors = validateWorkPreferences(prefs);
      expect(errors.preferredStartTime).toBeDefined();
      expect(errors.notes).toBeDefined();
    });

    it("should not validate time when preferredStartTime is empty", () => {
      const prefs: WorkPreferences = {
        workSchedule: "",
        workLocation: "",
        preferredStartTime: "",
        notes: ""
      };
      const errors = validateWorkPreferences(prefs);
      expect(errors.preferredStartTime).toBeUndefined();
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

    it("should return empty string for empty value", () => {
      expect(getWorkScheduleLabel("")).toBe("");
    });
  });

  describe("getWorkLocationLabel", () => {
    it("should return 'Onsite' for ONSITE", () => {
      expect(getWorkLocationLabel(WorkLocationPreference.ONSITE)).toBe(
        "Onsite"
      );
    });

    it("should return 'Remote' for REMOTE", () => {
      expect(getWorkLocationLabel(WorkLocationPreference.REMOTE)).toBe(
        "Remote"
      );
    });

    it("should return 'Hybrid' for HYBRID", () => {
      expect(getWorkLocationLabel(WorkLocationPreference.HYBRID)).toBe(
        "Hybrid"
      );
    });

    it("should return empty string for empty value", () => {
      expect(getWorkLocationLabel("")).toBe("");
    });
  });

  describe("formatWorkPreferencesSummary", () => {
    it("should return 'No preferences set' when all fields are empty", () => {
      expect(formatWorkPreferencesSummary(DEFAULT_WORK_PREFERENCES)).toBe(
        "No preferences set"
      );
    });

    it("should include schedule label when workSchedule is set", () => {
      const prefs: WorkPreferences = {
        ...DEFAULT_WORK_PREFERENCES,
        workSchedule: WorkSchedulePreference.FLEXIBLE
      };
      expect(formatWorkPreferencesSummary(prefs)).toBe("Schedule: Flexible");
    });

    it("should include location label when workLocation is set", () => {
      const prefs: WorkPreferences = {
        ...DEFAULT_WORK_PREFERENCES,
        workLocation: WorkLocationPreference.REMOTE
      };
      expect(formatWorkPreferencesSummary(prefs)).toBe("Location: Remote");
    });

    it("should include start time when preferredStartTime is set", () => {
      const prefs: WorkPreferences = {
        ...DEFAULT_WORK_PREFERENCES,
        preferredStartTime: "09:00"
      };
      expect(formatWorkPreferencesSummary(prefs)).toBe("Start: 09:00");
    });

    it("should join multiple parts with pipe separator", () => {
      const prefs: WorkPreferences = {
        workSchedule: WorkSchedulePreference.FIXED,
        workLocation: WorkLocationPreference.ONSITE,
        preferredStartTime: "08:30",
        notes: ""
      };
      expect(formatWorkPreferencesSummary(prefs)).toBe(
        "Schedule: Fixed | Location: Onsite | Start: 08:30"
      );
    });

    it("should not include notes in summary", () => {
      const prefs: WorkPreferences = {
        ...DEFAULT_WORK_PREFERENCES,
        notes: "Some important notes"
      };
      expect(formatWorkPreferencesSummary(prefs)).toBe("No preferences set");
    });
  });

  describe("hasWorkPreferences", () => {
    it("should return false when all fields are empty", () => {
      expect(hasWorkPreferences(DEFAULT_WORK_PREFERENCES)).toBe(false);
    });

    it("should return true when workSchedule is set", () => {
      const prefs: WorkPreferences = {
        ...DEFAULT_WORK_PREFERENCES,
        workSchedule: WorkSchedulePreference.FLEXIBLE
      };
      expect(hasWorkPreferences(prefs)).toBe(true);
    });

    it("should return true when workLocation is set", () => {
      const prefs: WorkPreferences = {
        ...DEFAULT_WORK_PREFERENCES,
        workLocation: WorkLocationPreference.HYBRID
      };
      expect(hasWorkPreferences(prefs)).toBe(true);
    });

    it("should return true when preferredStartTime is set", () => {
      const prefs: WorkPreferences = {
        ...DEFAULT_WORK_PREFERENCES,
        preferredStartTime: "10:00"
      };
      expect(hasWorkPreferences(prefs)).toBe(true);
    });

    it("should return true when notes is set", () => {
      const prefs: WorkPreferences = {
        ...DEFAULT_WORK_PREFERENCES,
        notes: "Work from home on Fridays"
      };
      expect(hasWorkPreferences(prefs)).toBe(true);
    });

    it("should return true when all fields are set", () => {
      const prefs: WorkPreferences = {
        workSchedule: WorkSchedulePreference.COMPRESSED,
        workLocation: WorkLocationPreference.HYBRID,
        preferredStartTime: "07:00",
        notes: "Compressed week schedule"
      };
      expect(hasWorkPreferences(prefs)).toBe(true);
    });
  });
});
