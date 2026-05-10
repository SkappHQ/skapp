import {
  isValidTimeFormat,
  validateWorkPreferences,
  getWorkScheduleLabel,
  getWorkLocationLabel,
  formatWorkPreferencesSummary,
  hasWorkPreferences,
  WorkSchedulePreference,
  WorkLocationPreference,
  DEFAULT_WORK_PREFERENCES,
  WORK_SCHEDULE_OPTIONS,
  WORK_LOCATION_OPTIONS,
  type WorkPreferences
} from "./workPreferenceUtils";

describe("workPreferenceUtils", () => {
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

    it("should return true for valid time 12:30", () => {
      expect(isValidTimeFormat("12:30")).toBe(true);
    });

    it("should return false for invalid hour 25:00", () => {
      expect(isValidTimeFormat("25:00")).toBe(false);
    });

    it("should return false for invalid minute 09:60", () => {
      expect(isValidTimeFormat("09:60")).toBe(false);
    });

    it("should return false for missing colon", () => {
      expect(isValidTimeFormat("0900")).toBe(false);
    });

    it("should return false for text input", () => {
      expect(isValidTimeFormat("invalid")).toBe(false);
    });

    it("should return false for single digit hour", () => {
      expect(isValidTimeFormat("9:00")).toBe(false);
    });

    it("should return false for single digit minute", () => {
      expect(isValidTimeFormat("09:0")).toBe(false);
    });

    it("should return false for extra characters", () => {
      expect(isValidTimeFormat("09:00:00")).toBe(false);
    });
  });

  describe("validateWorkPreferences", () => {
    it("should return empty errors for default preferences", () => {
      const errors = validateWorkPreferences(DEFAULT_WORK_PREFERENCES);
      expect(errors).toEqual({});
    });

    it("should return empty errors for valid preferences", () => {
      const preferences: WorkPreferences = {
        workSchedule: WorkSchedulePreference.FLEXIBLE,
        workLocation: WorkLocationPreference.REMOTE,
        preferredStartTime: "09:00",
        notes: "Some notes"
      };
      const errors = validateWorkPreferences(preferences);
      expect(errors).toEqual({});
    });

    it("should return error for invalid time format", () => {
      const preferences: WorkPreferences = {
        workSchedule: "",
        workLocation: "",
        preferredStartTime: "invalid",
        notes: ""
      };
      const errors = validateWorkPreferences(preferences);
      expect(errors.preferredStartTime).toBe(
        "Invalid time format. Use HH:mm (e.g., 09:00)"
      );
    });

    it("should return error for notes exceeding 500 characters", () => {
      const preferences: WorkPreferences = {
        workSchedule: "",
        workLocation: "",
        preferredStartTime: "",
        notes: "a".repeat(501)
      };
      const errors = validateWorkPreferences(preferences);
      expect(errors.notes).toBe("Notes must be 500 characters or less");
    });

    it("should return both errors for invalid time and long notes", () => {
      const preferences: WorkPreferences = {
        workSchedule: "",
        workLocation: "",
        preferredStartTime: "bad",
        notes: "a".repeat(501)
      };
      const errors = validateWorkPreferences(preferences);
      expect(errors.preferredStartTime).toBe(
        "Invalid time format. Use HH:mm (e.g., 09:00)"
      );
      expect(errors.notes).toBe("Notes must be 500 characters or less");
    });

    it("should not return error for notes at exactly 500 characters", () => {
      const preferences: WorkPreferences = {
        workSchedule: "",
        workLocation: "",
        preferredStartTime: "",
        notes: "a".repeat(500)
      };
      const errors = validateWorkPreferences(preferences);
      expect(errors.notes).toBeUndefined();
    });

    it("should not return error for empty preferredStartTime", () => {
      const preferences: WorkPreferences = {
        workSchedule: WorkSchedulePreference.FIXED,
        workLocation: WorkLocationPreference.ONSITE,
        preferredStartTime: "",
        notes: ""
      };
      const errors = validateWorkPreferences(preferences);
      expect(errors.preferredStartTime).toBeUndefined();
    });
  });

  describe("getWorkScheduleLabel", () => {
    it("should return 'Flexible' for FLEXIBLE", () => {
      expect(getWorkScheduleLabel(WorkSchedulePreference.FLEXIBLE)).toBe("Flexible");
    });

    it("should return 'Fixed' for FIXED", () => {
      expect(getWorkScheduleLabel(WorkSchedulePreference.FIXED)).toBe("Fixed");
    });

    it("should return 'Shift Based' for SHIFT_BASED", () => {
      expect(getWorkScheduleLabel(WorkSchedulePreference.SHIFT_BASED)).toBe("Shift Based");
    });

    it("should return 'Compressed Week' for COMPRESSED", () => {
      expect(getWorkScheduleLabel(WorkSchedulePreference.COMPRESSED)).toBe("Compressed Week");
    });

    it("should return empty string for empty value", () => {
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

    it("should return empty string for empty value", () => {
      expect(getWorkLocationLabel("")).toBe("");
    });
  });

  describe("formatWorkPreferencesSummary", () => {
    it("should return 'No preferences set' for default preferences", () => {
      expect(formatWorkPreferencesSummary(DEFAULT_WORK_PREFERENCES)).toBe(
        "No preferences set"
      );
    });

    it("should format schedule only", () => {
      const preferences: WorkPreferences = {
        workSchedule: WorkSchedulePreference.FLEXIBLE,
        workLocation: "",
        preferredStartTime: "",
        notes: ""
      };
      expect(formatWorkPreferencesSummary(preferences)).toBe("Schedule: Flexible");
    });

    it("should format location only", () => {
      const preferences: WorkPreferences = {
        workSchedule: "",
        workLocation: WorkLocationPreference.REMOTE,
        preferredStartTime: "",
        notes: ""
      };
      expect(formatWorkPreferencesSummary(preferences)).toBe("Location: Remote");
    });

    it("should format start time only", () => {
      const preferences: WorkPreferences = {
        workSchedule: "",
        workLocation: "",
        preferredStartTime: "09:00",
        notes: ""
      };
      expect(formatWorkPreferencesSummary(preferences)).toBe("Start: 09:00");
    });

    it("should format all fields with pipe separator", () => {
      const preferences: WorkPreferences = {
        workSchedule: WorkSchedulePreference.FIXED,
        workLocation: WorkLocationPreference.ONSITE,
        preferredStartTime: "08:00",
        notes: ""
      };
      expect(formatWorkPreferencesSummary(preferences)).toBe(
        "Schedule: Fixed | Location: Onsite | Start: 08:00"
      );
    });

    it("should not include notes in summary", () => {
      const preferences: WorkPreferences = {
        workSchedule: "",
        workLocation: "",
        preferredStartTime: "",
        notes: "Some notes"
      };
      expect(formatWorkPreferencesSummary(preferences)).toBe("No preferences set");
    });
  });

  describe("hasWorkPreferences", () => {
    it("should return false for default preferences", () => {
      expect(hasWorkPreferences(DEFAULT_WORK_PREFERENCES)).toBe(false);
    });

    it("should return true when workSchedule is set", () => {
      const preferences: WorkPreferences = {
        ...DEFAULT_WORK_PREFERENCES,
        workSchedule: WorkSchedulePreference.FLEXIBLE
      };
      expect(hasWorkPreferences(preferences)).toBe(true);
    });

    it("should return true when workLocation is set", () => {
      const preferences: WorkPreferences = {
        ...DEFAULT_WORK_PREFERENCES,
        workLocation: WorkLocationPreference.HYBRID
      };
      expect(hasWorkPreferences(preferences)).toBe(true);
    });

    it("should return true when preferredStartTime is set", () => {
      const preferences: WorkPreferences = {
        ...DEFAULT_WORK_PREFERENCES,
        preferredStartTime: "10:00"
      };
      expect(hasWorkPreferences(preferences)).toBe(true);
    });

    it("should return true when notes is set", () => {
      const preferences: WorkPreferences = {
        ...DEFAULT_WORK_PREFERENCES,
        notes: "test"
      };
      expect(hasWorkPreferences(preferences)).toBe(true);
    });

    it("should return true when all fields are set", () => {
      const preferences: WorkPreferences = {
        workSchedule: WorkSchedulePreference.COMPRESSED,
        workLocation: WorkLocationPreference.REMOTE,
        preferredStartTime: "07:30",
        notes: "Early bird"
      };
      expect(hasWorkPreferences(preferences)).toBe(true);
    });
  });

  describe("constants", () => {
    it("should have 4 work schedule options", () => {
      expect(WORK_SCHEDULE_OPTIONS).toHaveLength(4);
    });

    it("should have 3 work location options", () => {
      expect(WORK_LOCATION_OPTIONS).toHaveLength(3);
    });

    it("should have correct default values", () => {
      expect(DEFAULT_WORK_PREFERENCES).toEqual({
        workSchedule: "",
        workLocation: "",
        preferredStartTime: "",
        notes: ""
      });
    });
  });
});
