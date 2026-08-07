import { BirthdayModalVariant } from "~community/people/enums/BirthdayNotificationEnums";
import {
  BirthdayQueueEntryType,
  EmployeeBirthdayType,
  PartitionedBirthdaysType
} from "~community/people/types/BirthdayNotificationTypes";

export const normalizeEmployeeId = (
  employeeId: string | number | undefined
): number | undefined => {
  if (employeeId === undefined) {
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
  viewerEmployeeId: number | undefined
): PartitionedBirthdaysType => {
  const namedBirthdays = employeeBirthdays.filter(
    (employee) => !!employee.firstName?.trim() || !!employee.lastName?.trim()
  );

  if (viewerEmployeeId === undefined) {
    return { self: null, colleagues: namedBirthdays };
  }

  const isViewer = (employee: EmployeeBirthdayType): boolean =>
    employee.employeeId === viewerEmployeeId;

  return {
    self: namedBirthdays.find(isViewer) ?? null,
    colleagues: namedBirthdays.filter((employee) => !isViewer(employee))
  };
};

export const buildBirthdayQueue = (
  employeeBirthdays: EmployeeBirthdayType[],
  viewerEmployeeId: number | undefined
): BirthdayQueueEntryType[] => {
  const { self, colleagues } = partitionBirthdays(
    employeeBirthdays,
    viewerEmployeeId
  );

  return [
    ...(self ? [{ variant: BirthdayModalVariant.SELF, employee: self }] : []),
    ...colleagues.map((employee) => ({
      variant: BirthdayModalVariant.COLLEAGUE,
      employee
    }))
  ];
};
