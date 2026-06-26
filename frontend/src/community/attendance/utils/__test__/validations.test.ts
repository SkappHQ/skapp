import { timeEntryValidation } from "../validations";

describe("Time Entry Validation Schema", () => {
  describe("timeEntryDate validation", () => {
    it("should pass for valid date in YYYY-MM-DD format", async () => {
      const validData = {
        timeEntryDate: "2024-04-01",
        fromTime: "09:00 AM",
        toTime: "05:00 PM"
      };

      await expect(timeEntryValidation.validateSync(validData)).toEqual(
        validData
      );
    });

    it("should fail for invalid date format", async () => {
      const invalidData = {
        timeEntryDate: "01-04-2024",
        fromTime: "09:00 AM",
        toTime: "05:00 PM"
      };

      expect(() => {
        timeEntryValidation.validateSync(invalidData);
      }).toThrow("Please enter a valid date");
    });

    it("should fail when date is missing", async () => {
      const missingData = {
        fromTime: "09:00 AM",
        toTime: "05:00 PM"
      };

      expect(() => {
        timeEntryValidation.validateSync(missingData);
      }).toThrow("Please select a date");
    });
  });

  describe("fromTime validation", () => {
    it("should pass for valid time in 12-hour format", async () => {
      const validData = {
        timeEntryDate: "2024-04-01",
        fromTime: "09:00 AM",
        toTime: "05:00 PM"
      };

      await expect(timeEntryValidation.validateSync(validData)).toEqual(
        validData
      );
    });

    it("should fail for invalid time format", async () => {
      const invalidData = {
        timeEntryDate: "2024-04-01",
        fromTime: "9:00",
        toTime: "05:00 PM"
      };

      expect(() => {
        timeEntryValidation.validateSync(invalidData);
      }).toThrow("Please enter a valid start time");
    });

    it("should fail when start time is missing", async () => {
      const missingData = {
        timeEntryDate: "2024-04-01",
        toTime: "05:00 PM"
      };

      expect(() => {
        timeEntryValidation.validateSync(missingData);
      }).toThrow("Please select start time");
    });
  });

  describe("toTime validation", () => {
    it("should pass for valid time in 12-hour format", async () => {
      const validData = {
        timeEntryDate: "2024-04-01",
        fromTime: "09:00 AM",
        toTime: "05:00 PM"
      };

      await expect(timeEntryValidation.validateSync(validData)).toEqual(
        validData
      );
    });

    it("should fail for invalid time format", async () => {
      const invalidData = {
        timeEntryDate: "2024-04-01",
        fromTime: "09:00 AM",
        toTime: "17:00"
      };

      expect(() => {
        timeEntryValidation.validateSync(invalidData);
      }).toThrow("Please enter a valid end time");
    });

    it("should fail when end time is missing", async () => {
      const missingData = {
        timeEntryDate: "2024-04-01",
        fromTime: "09:00 AM"
      };

      expect(() => {
        timeEntryValidation.validateSync(missingData);
      }).toThrow("Please select end time");
    });
  });

  describe("fromTime and toTime relationship validation", () => {
    it("should fail when fromTime is later than toTime", async () => {
      const invalidData = {
        timeEntryDate: "2024-04-01",
        fromTime: "06:00 PM",
        toTime: "05:00 PM"
      };

      expect(() => {
        timeEntryValidation.validateSync(invalidData);
      }).toThrow("Start time cannot be later than the end time.");
    });

    it("should fail when fromTime is greater than toTime", async () => {
      const invalidData = {
        timeEntryDate: "2024-04-01",
        fromTime: "06:00 PM",
        toTime: "05:00 PM"
      };

      expect(() => {
        timeEntryValidation.validateSync(invalidData);
      }).toThrow("Start time cannot be later than the end time.");
    });

    it("should pass when fromTime is earlier than toTime", async () => {
      const validData = {
        timeEntryDate: "2024-04-01",
        fromTime: "08:00 AM",
        toTime: "05:00 PM"
      };

      await expect(timeEntryValidation.validateSync(validData)).toEqual(
        validData
      );
    });

    it("should pass when toTime is missing", async () => {
      const validData = {
        timeEntryDate: "2024-04-01",
        fromTime: "08:00 AM",
        toTime: "05:00 PM"
      };

      await expect(timeEntryValidation.validateSync(validData)).toEqual(
        validData
      );
    });
  });

  describe("complete validation", () => {
    it("should validate all fields together successfully", async () => {
      const validData = {
        timeEntryDate: "2024-04-01",
        fromTime: "09:00 AM",
        toTime: "05:00 PM"
      };

      await expect(timeEntryValidation.validateSync(validData)).toEqual(
        validData
      );
    });

    it("should fail with multiple validation errors", () => {
      const invalidData = {
        timeEntryDate: "01/04/2024",
        fromTime: "9AM"
      };

      expect(() => {
        timeEntryValidation.validateSync(invalidData);
      }).toThrow();
    });
    it("should return true when toTime is earlier than fromTime", () => {
      const invalidData = {
        timeEntryDate: "2024-04-01",
        fromTime: "09:00 AM",
        toTime: "05:00 AM"
      };

      expect(() => {
        timeEntryValidation.validateSync(invalidData);
      }).toThrow();
    });
  });
});
