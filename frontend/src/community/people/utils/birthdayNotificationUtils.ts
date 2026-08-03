import { BirthdayModalVariant } from "~community/people/enums/BirthdayNotificationEnums";
import {
  BirthdayQueueEntryType,
  EmployeeBirthdayType,
  EmployeeIdType,
  PartitionedBirthdaysType
} from "~community/people/types/BirthdayNotificationTypes";

export const getFullName = (
  employee: Pick<EmployeeBirthdayType, "firstName" | "lastName">
): string =>
  [employee.firstName?.trim(), employee.lastName?.trim()]
    .filter(Boolean)
    .join(" ");

export const hasDisplayableName = (employee: EmployeeBirthdayType): boolean =>
  getFullName(employee).length > 0;

export const normalizeEmployeeId = (
  employeeId: EmployeeIdType
): number | undefined => {
  if (employeeId === null || employeeId === undefined) {
    return undefined;
  }

  if (typeof employeeId === "string" && employeeId.trim().length === 0) {
    return undefined;
  }

  const numericEmployeeId = Number(employeeId);

  return Number.isFinite(numericEmployeeId) ? numericEmployeeId : undefined;
};

export const partitionBirthdays = (
  employeeBirthdays: EmployeeBirthdayType[],
  currentEmployeeId: EmployeeIdType
): PartitionedBirthdaysType => {
  const namedBirthdays = employeeBirthdays.filter(hasDisplayableName);
  const viewerEmployeeId = normalizeEmployeeId(currentEmployeeId);

  if (viewerEmployeeId === undefined) {
    return { self: null, colleagues: namedBirthdays };
  }

  const isViewer = (employee: EmployeeBirthdayType): boolean =>
    normalizeEmployeeId(employee.employeeId) === viewerEmployeeId;

  return {
    self: namedBirthdays.find(isViewer) ?? null,
    colleagues: namedBirthdays.filter((employee) => !isViewer(employee))
  };
};

export const buildBirthdayQueue = (
  employeeBirthdays: EmployeeBirthdayType[],
  currentEmployeeId: EmployeeIdType
): BirthdayQueueEntryType[] => {
  const { self, colleagues } = partitionBirthdays(
    employeeBirthdays,
    currentEmployeeId
  );

  return [
    ...(self ? [{ variant: BirthdayModalVariant.SELF, employee: self }] : []),
    ...colleagues.map((employee) => ({
      variant: BirthdayModalVariant.COLLEAGUE,
      employee
    }))
  ];
};
