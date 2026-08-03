import { BirthdayModalVariant } from "~community/people/enums/BirthdayNotificationEnums";
import { EmployeeBirthdayType } from "~community/people/types/BirthdayNotificationTypes";

import {
  buildBirthdayQueue,
  getFullName,
  normalizeEmployeeId,
  partitionBirthdays
} from "./birthdayNotificationUtils";

const buildEmployee = (
  overrides: Partial<EmployeeBirthdayType> = {}
): EmployeeBirthdayType => ({
  employeeId: 1,
  firstName: "Charlotte",
  lastName: "Matthews",
  authPic: null,
  email: "charlotte@rootcodelabs.com",
  ...overrides
});

describe("getFullName", () => {
  it("joins first and last name", () => {
    expect(getFullName(buildEmployee())).toBe("Charlotte Matthews");
  });

  it("omits a blank last name without leaving a trailing space", () => {
    expect(getFullName(buildEmployee({ lastName: "" }))).toBe("Charlotte");
  });

  it("omits a whitespace-only first name", () => {
    expect(getFullName(buildEmployee({ firstName: "   " }))).toBe("Matthews");
  });

  it("returns an empty string when both names are blank", () => {
    expect(getFullName(buildEmployee({ firstName: "", lastName: "" }))).toBe(
      ""
    );
  });
});

describe("normalizeEmployeeId", () => {
  it("returns the numeric form of a string id", () => {
    expect(normalizeEmployeeId("7")).toBe(7);
  });

  it("returns a numeric id unchanged", () => {
    expect(normalizeEmployeeId(7)).toBe(7);
  });

  it("returns undefined for missing ids", () => {
    expect(normalizeEmployeeId(undefined)).toBeUndefined();
    expect(normalizeEmployeeId(null)).toBeUndefined();
  });

  it("returns undefined for blank and non numeric ids", () => {
    expect(normalizeEmployeeId("")).toBeUndefined();
    expect(normalizeEmployeeId("   ")).toBeUndefined();
    expect(normalizeEmployeeId("abc")).toBeUndefined();
  });
});

describe("partitionBirthdays", () => {
  const self = buildEmployee({ employeeId: 7, firstName: "Mia" });
  const colleagueOne = buildEmployee({ employeeId: 8, firstName: "Jacob" });
  const colleagueTwo = buildEmployee({ employeeId: 9, firstName: "Ana" });

  it("separates the viewer from colleagues by employee id", () => {
    const result = partitionBirthdays([colleagueOne, self, colleagueTwo], 7);

    expect(result.self).toBe(self);
    expect(result.colleagues).toEqual([colleagueOne, colleagueTwo]);
  });

  it("returns a null self when the viewer has no birthday today", () => {
    const result = partitionBirthdays([colleagueOne, colleagueTwo], 7);

    expect(result.self).toBeNull();
    expect(result.colleagues).toEqual([colleagueOne, colleagueTwo]);
  });

  it("preserves the backend ordering of colleagues", () => {
    const result = partitionBirthdays([colleagueTwo, colleagueOne], 7);

    expect(result.colleagues.map((employee) => employee.employeeId)).toEqual([
      9, 8
    ]);
  });

  it("treats everyone as a colleague when the viewer id is unavailable", () => {
    const result = partitionBirthdays([self, colleagueOne], undefined);

    expect(result.self).toBeNull();
    expect(result.colleagues).toEqual([self, colleagueOne]);
  });

  it("matches the viewer when the viewer id arrives as a string", () => {
    const result = partitionBirthdays([colleagueOne, self], "7");

    expect(result.self).toBe(self);
    expect(result.colleagues).toEqual([colleagueOne]);
  });

  it("excludes employees with no displayable name", () => {
    const nameless = buildEmployee({
      employeeId: 10,
      firstName: "",
      lastName: ""
    });

    const result = partitionBirthdays([colleagueOne, nameless], 7);

    expect(result.colleagues).toEqual([colleagueOne]);
  });
});

describe("buildBirthdayQueue", () => {
  const self = buildEmployee({ employeeId: 7, firstName: "Mia" });
  const colleagueOne = buildEmployee({ employeeId: 8, firstName: "Jacob" });
  const colleagueTwo = buildEmployee({ employeeId: 9, firstName: "Ana" });

  it("returns an empty queue when nobody has a birthday", () => {
    expect(buildBirthdayQueue([], 7)).toEqual([]);
  });

  it("queues a single self entry when only the viewer has a birthday", () => {
    expect(buildBirthdayQueue([self], 7)).toEqual([
      { variant: BirthdayModalVariant.SELF, employee: self }
    ]);
  });

  it("queues one colleague entry per colleague in backend order", () => {
    expect(buildBirthdayQueue([colleagueTwo, colleagueOne], 7)).toEqual([
      { variant: BirthdayModalVariant.COLLEAGUE, employee: colleagueTwo },
      { variant: BirthdayModalVariant.COLLEAGUE, employee: colleagueOne }
    ]);
  });

  it("places the viewer first and colleagues after", () => {
    expect(buildBirthdayQueue([colleagueOne, self, colleagueTwo], 7)).toEqual([
      { variant: BirthdayModalVariant.SELF, employee: self },
      { variant: BirthdayModalVariant.COLLEAGUE, employee: colleagueOne },
      { variant: BirthdayModalVariant.COLLEAGUE, employee: colleagueTwo }
    ]);
  });

  it("excludes employees with no displayable name", () => {
    const nameless = buildEmployee({
      employeeId: 10,
      firstName: "",
      lastName: ""
    });

    expect(buildBirthdayQueue([colleagueOne, nameless], 7)).toEqual([
      { variant: BirthdayModalVariant.COLLEAGUE, employee: colleagueOne }
    ]);
  });

  it("treats everyone as a colleague when the viewer id is unavailable", () => {
    expect(buildBirthdayQueue([self, colleagueOne], undefined)).toEqual([
      { variant: BirthdayModalVariant.COLLEAGUE, employee: self },
      { variant: BirthdayModalVariant.COLLEAGUE, employee: colleagueOne }
    ]);
  });
});
