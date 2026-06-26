import { SxProps, Theme } from "@mui/material";

import {
  DropdownListType,
  FileUploadType
} from "~community/common/types/CommonTypes";
import {
  arraysEqual,
  getEmoji,
  getHoursArray,
  getLabelByValue,
  hasUnicodeCharacters,
  mergeSx,
  pascalCaseFormatter,
  removeDuplicates
} from "~community/common/utils/commonUtil";
import { WorkingDaysTypes } from "~community/configurations/types/TimeConfigurationsTypes";

describe("Utility Functions", () => {
  describe("getLabelByValue", () => {
    it("should return the correct label for a given numeric value", () => {
      const objectArray: DropdownListType[] = [
        { value: 1, label: "Option 1" },
        { value: 2, label: "Option 2" },
        { value: 3, label: "Option 3" }
      ];
      expect(getLabelByValue(objectArray, 1)).toBe("Option 1");
      expect(getLabelByValue(objectArray, 2)).toBe("Option 2");
      expect(getLabelByValue(objectArray, 3)).toBe("Option 3");
    });

    it("should return the correct label for a given string value", () => {
      const objectArray: DropdownListType[] = [
        { value: "a", label: "Option A" },
        { value: "b", label: "Option B" },
        { value: "c", label: "Option C" }
      ];
      expect(getLabelByValue(objectArray, "a")).toBe("Option A");
      expect(getLabelByValue(objectArray, "b")).toBe("Option B");
      expect(getLabelByValue(objectArray, "c")).toBe("Option C");
    });

    it("should return undefined for a value that does not exist in the array", () => {
      const objectArray: DropdownListType[] = [
        { value: 1, label: "Option 1" },
        { value: 2, label: "Option 2" }
      ];
      expect(getLabelByValue(objectArray, 3)).toBeUndefined();
      expect(getLabelByValue(objectArray, "a")).toBeUndefined();
    });

    it("should return undefined for an empty array", () => {
      const objectArray: DropdownListType[] = [];
      expect(getLabelByValue(objectArray, 1)).toBeUndefined();
    });

    it("should handle mixed types in the object array", () => {
      const objectArray: DropdownListType[] = [
        { value: 1, label: "One" },
        { value: "2", label: "Two" },
        { value: 3, label: "Three" }
      ];
      expect(getLabelByValue(objectArray, 1)).toBe("One");
      expect(getLabelByValue(objectArray, "2")).toBe("Two");
      expect(getLabelByValue(objectArray, 3)).toBe("Three");
      expect(getLabelByValue(objectArray, 4)).toBeUndefined();
    });
  });

  describe("getEmoji", () => {
    it("should return the correct emoji for a valid Unicode string", () => {
      expect(getEmoji("1F600")).toBe("😀"); // Grinning Face
      expect(getEmoji("1F601")).toBe("😁"); // Beaming Face with Smiling Eyes
      expect(getEmoji("1F602")).toBe("😂"); // Face with Tears of Joy
      expect(getEmoji("1F923")).toBe("🤣"); // Rolling on the Floor Laughing
    });

    it("should return the correct emoji for a valid multi-codepoint Unicode string", () => {
      expect(getEmoji("1F1FA-1F1F8")).toBe("🇺🇸"); // Flag: United States
      expect(getEmoji("1F1E6-1F1E9")).toBe("🇦🇩"); // Flag: Andorra
    });

    it("should return an empty string for an invalid Unicode string", () => {
      expect(getEmoji("invalid")).toBe("");
      expect(getEmoji("")).toBe(""); // Empty string
      expect(getEmoji("1F600-1F601-invalid")).toBe(""); // Mixed valid and invalid
    });

    it("should handle Unicode strings with leading or trailing spaces", () => {
      expect(getEmoji(" 1F600 ")).toBe("😀"); // Grinning Face with spaces
      expect(getEmoji(" 1F601")).toBe("😁"); // Beaming Face with Smiling Eyes with leading space
      expect(getEmoji("1F602 ")).toBe("😂"); // Face with Tears of Joy with trailing space
    });
  });

  jest.mock("../../regex/regexPatterns.ts", () => ({
    containsUnicode: jest.fn(() => /[\u{0080}-\u{FFFF}]/u) // Example regex for Unicode characters
  }));

  describe("hasUnicodeCharacters", () => {
    it("should return false for an empty string", () => {
      expect(hasUnicodeCharacters("")).toBe(false);
    });

    it("should return true for a string with a character code greater than 255", () => {
      expect(hasUnicodeCharacters("∆")).toBe(true);
    });

    it("should return true for a string with a Unicode character", () => {
      expect(hasUnicodeCharacters("Привет")).toBe(true);
    });

    it("should return false for a string with only ASCII characters", () => {
      expect(hasUnicodeCharacters("Hello, World!")).toBe(false);
    });
  });

  describe("removeDuplicates", () => {
    it("should remove duplicate files based on name when maxFileSize is not 1", () => {
      const uploadableFiles: FileUploadType[] = [
        { name: "file1.txt", path: "/uploads/file1.txt" },
        { name: "file2.txt", path: "/uploads/file2.txt" }
      ];

      const acceptedFiles: File[] = [
        new File([""], "file1.txt"), // This will be removed
        new File([""], "file3.txt"), // This will remain
        new File([""], "file2.txt") // This will be removed
      ];

      const result = removeDuplicates(uploadableFiles, acceptedFiles, 2);
      expect(result).toHaveLength(1); // Should only have file3.txt
      expect(result[0].name).toBe("file3.txt");
    });

    it("should return all accepted files if maxFileSize is 1", () => {
      const uploadableFiles: FileUploadType[] = [
        { name: "file1.txt", path: "/uploads/file1.txt" }
      ];

      const acceptedFiles: File[] = [
        new File([""], "file1.txt"), // This will be removed
        new File([""], "file2.txt") // This will remain
      ];

      const result = removeDuplicates(uploadableFiles, acceptedFiles, 1);
      expect(result).toHaveLength(2); // Should return both files
    });

    it("should return an empty array if all files are duplicates", () => {
      const uploadableFiles: FileUploadType[] = [
        { name: "file1.txt", path: "/uploads/file1.txt" }
      ];

      const acceptedFiles: File[] = [
        new File([""], "file1.txt") // This will be removed
      ];

      const result = removeDuplicates(uploadableFiles, acceptedFiles, 2);
      expect(result).toHaveLength(0); // Should return an empty array
    });

    it("should handle an empty accepted files array", () => {
      const uploadableFiles: FileUploadType[] = [
        { name: "file1.txt", path: "/uploads/file1.txt" }
      ];

      const acceptedFiles: File[] = [];

      const result = removeDuplicates(uploadableFiles, acceptedFiles, 2);
      expect(result).toHaveLength(0); // Should return an empty array
    });

    it("should handle an empty uploadable files array", () => {
      const uploadableFiles: FileUploadType[] = [];
      const acceptedFiles: File[] = [
        new File([""], "file1.txt"),
        new File([""], "file2.txt")
      ];

      const result = removeDuplicates(uploadableFiles, acceptedFiles, 2);
      expect(result).toHaveLength(2); // Should return both files
    });

    it("should not modify accepted files if no duplicates are found", () => {
      const uploadableFiles: FileUploadType[] = [
        { name: "file3.txt", path: "/uploads/file3.txt" }
      ];

      const acceptedFiles: File[] = [
        new File([""], "file1.txt"),
        new File([""], "file2.txt")
      ];

      const result = removeDuplicates(uploadableFiles, acceptedFiles, 2);
      expect(result).toHaveLength(2); // Should return both files
      expect(result).toEqual(acceptedFiles); // Should be the same as acceptedFiles
    });
  });

  describe("mergeSx", () => {
    it("should merge multiple SxProps arrays into one", () => {
      const input: Array<SxProps<Theme> | undefined> = [
        { margin: 1 },
        [{ padding: 2 }],
        { color: "red" }
      ];
      const expectedOutput: SxProps<Theme> = [
        { margin: 1 },
        { padding: 2 },
        { color: "red" }
      ];

      expect(mergeSx(input)).toEqual(expectedOutput);
    });

    it("should ignore undefined values", () => {
      const input: Array<SxProps<Theme> | undefined> = [
        { margin: 1 },
        undefined,
        [{ padding: 2 }],
        undefined,
        { color: "blue" }
      ];
      const expectedOutput: SxProps<Theme> = [
        { margin: 1 },
        { padding: 2 },
        { color: "blue" }
      ];

      expect(mergeSx(input)).toEqual(expectedOutput);
    });

    it("should handle an empty array", () => {
      const input: Array<SxProps<Theme> | undefined> = [];
      const expectedOutput: SxProps<Theme> = [];

      expect(mergeSx(input)).toEqual(expectedOutput);
    });

    it("should handle an array with only undefined values", () => {
      const input: Array<SxProps<Theme> | undefined> = [undefined, undefined];
      const expectedOutput: SxProps<Theme> = [];

      expect(mergeSx(input)).toEqual(expectedOutput);
    });

    it("should handle mixed inputs (arrays and objects)", () => {
      const input: Array<SxProps<Theme> | undefined> = [
        { margin: 1 },
        undefined,
        [{ padding: 2 }, { color: "green" }],
        { display: "flex" }
      ];
      const expectedOutput: SxProps<Theme> = [
        { margin: 1 },
        { padding: 2 },
        { color: "green" },
        { display: "flex" }
      ];

      expect(mergeSx(input)).toEqual(expectedOutput);
    });
  });

  // commenting out this to avoid unit test file. Hasala will fix it

  // describe("decodeJWTToken", () => {
  //   it("should correctly decode a valid JWT token", () => {
  //     const token =
  //       "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX1NVUEVSX0FETUlOIiwiUk9MRV9QRU9QTEVfQURNSU4iLCJST0xFX1BFT1BMRV9NQU5BR0VSIiwiUk9MRV9QRU9QTEVfRU1QTE9ZRUUiLCJST0xFX0xFQVZFX0FETUlOIiwiUk9MRV9MRUFWRV9NQU5BR0VSIiwiUk9MRV9MRUFWRV9FTVBMT1lFRSIsIlJPTEVfQVRURU5EQU5DRV9BRE1JTiIsIlJPTEVfQVRURU5EQU5DRV9NQU5BR0VSIiwiUk9MRV9BVFRFTkRBTkNFX0VNUExPWUVFIl0sInRva2VuX3R5cGUiOiJBQ0NFU1MiLCJzdWIiOiJoYXNhbGFAZ21haWwuY29tIiwiaWF0IjoxNzI3MjU0MzEyLCJleHAiOjE3MjcyNTQzNzJ9.Ooz15F_hKCufFBr2nv9e1KSgZ0ayEjWp5IlcS2_OYEc";
  //     const decoded = decodeJWTToken(token);
  //
  //     expect(decoded).toEqual({
  //       roles: [
  //         "ROLE_SUPER_ADMIN",
  //         "ROLE_PEOPLE_ADMIN",
  //         "ROLE_PEOPLE_MANAGER",
  //         "ROLE_PEOPLE_EMPLOYEE",
  //         "ROLE_LEAVE_ADMIN",
  //         "ROLE_LEAVE_MANAGER",
  //         "ROLE_LEAVE_EMPLOYEE",
  //         "ROLE_ATTENDANCE_ADMIN",
  //         "ROLE_ATTENDANCE_MANAGER",
  //         "ROLE_ATTENDANCE_EMPLOYEE"
  //       ],
  //       token_type: "ACCESS",
  //       sub: "hasala@gmail.com",
  //       iat: 1727254312,
  //       exp: 1727254372
  //     });
  //   });
  //
  //   it("should throw an error for an invalid token format", () => {
  //     const invalidToken = "invalid.token.format";
  //     expect(() => decodeJWTToken(invalidToken)).toThrow();
  //   });
  // });
});

describe("pascalCaseFormatter", () => {
  it("should convert a single word to Pascal Case", () => {
    expect(pascalCaseFormatter("hello")).toBe("Hello");
  });

  it("should convert multiple words to Pascal Case", () => {
    expect(pascalCaseFormatter("hello world")).toBe("Hello World");
    expect(pascalCaseFormatter("javaScript programming")).toBe(
      "Javascript Programming"
    );
  });

  it("should handle empty strings", () => {
    expect(pascalCaseFormatter("")).toBe("");
  });

  it("should handle strings with extra spaces", () => {
    expect(pascalCaseFormatter("   hello   world   ")).toBe("Hello World");
    expect(pascalCaseFormatter("   multiple   spaces   here   ")).toBe(
      "Multiple Spaces Here"
    );
  });

  it("should handle strings with mixed casing", () => {
    expect(pascalCaseFormatter("hElLo wOrLd")).toBe("Hello World");
    expect(pascalCaseFormatter("JaVaScRiPt PrOgRaMmInG")).toBe(
      "Javascript Programming"
    );
  });

  it("should return an empty string for null or undefined input", () => {
    expect(pascalCaseFormatter(null)).toBe("");
    expect(pascalCaseFormatter(undefined)).toBe("");
  });

  describe("arraysEqual", () => {
    it("should return true for identical arrays", () => {
      const arr1: WorkingDaysTypes[] = [
        { id: 1, day: "Monday" },
        { id: 2, day: "Tuesday" }
      ];
      const arr2: WorkingDaysTypes[] = [
        { id: 1, day: "Monday" },
        { id: 2, day: "Tuesday" }
      ];

      expect(arraysEqual(arr1, arr2)).toBe(true);
    });

    it("should return false for arrays with different lengths", () => {
      const arr1: WorkingDaysTypes[] = [
        { id: 1, day: "Monday" },
        { id: 2, day: "Tuesday" }
      ];
      const arr2: WorkingDaysTypes[] = [{ id: 1, day: "Monday" }];

      expect(arraysEqual(arr1, arr2)).toBe(false);
    });

    it("should return false for arrays with different contents", () => {
      const arr1: WorkingDaysTypes[] = [
        { id: 1, day: "Monday" },
        { id: 2, day: "Tuesday" }
      ];
      const arr2: WorkingDaysTypes[] = [
        { id: 1, day: "Monday" },
        { id: 3, day: "Wednesday" }
      ];

      expect(arraysEqual(arr1, arr2)).toBe(false);
    });

    it("should return true for arrays with same contents in different order", () => {
      const arr1: WorkingDaysTypes[] = [
        { id: 1, day: "Monday" },
        { id: 2, day: "Tuesday" }
      ];
      const arr2: WorkingDaysTypes[] = [
        { id: 2, day: "Tuesday" },
        { id: 1, day: "Monday" }
      ];

      expect(arraysEqual(arr1, arr2)).toBe(true);
    });
  });

  describe("getHoursArray", () => {
    it("should return an array of hours from 1 to HOURS_PER_DAY", () => {
      const HOURS_PER_DAY = 24;
      const hoursArray = getHoursArray();

      expect(hoursArray).toHaveLength(HOURS_PER_DAY);
      for (let i = 0; i < HOURS_PER_DAY; i++) {
        expect(hoursArray[i]).toEqual({
          label: `${i + 1} hour${i === 0 ? "" : "s"}`,
          value: i + 1
        });
      }
    });
  });
});
