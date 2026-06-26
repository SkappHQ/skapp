import { DateTime } from "luxon";

import {
  formatDayWithOrdinalIndicator,
  isDateTimeSimilar,
  parseStringWithCurrentYearAndConvertToDateTime
} from "~community/common/utils/dateTimeUtils";
import {
  ResourceAvailabilityPayload,
  TeamAvailabilityDataType
} from "~community/leave/types/MyRequests";

interface GetTeamAvailabilityDataProps {
  selectedDates: DateTime[];
  resourceAvailability: ResourceAvailabilityPayload[] | undefined;
}

export const getTeamAvailabilityData = ({
  selectedDates,
  resourceAvailability
}: GetTeamAvailabilityDataProps): TeamAvailabilityDataType[] => {
  if (!resourceAvailability || !selectedDates.length) return [];

  const startDate = selectedDates[0];
  const endDate = selectedDates[1];

  const dataForSelectedDates =
    resourceAvailability?.filter((resource) => {
      const resourceDate = parseStringWithCurrentYearAndConvertToDateTime(
        resource.date
      );

      if (selectedDates.length === 1) {
        return isDateTimeSimilar(startDate, resourceDate);
      }

      return resourceDate >= startDate && resourceDate <= endDate;
    }) ?? [];

  const formattedData = dataForSelectedDates.map((resource) => {
    const employeesWithLeaveRequests = resource.leaveRequests.map(
      (leaveRequest) => ({
        firstName: leaveRequest.employee.firstName,
        lastName: leaveRequest.employee.lastName,
        image: leaveRequest.employee.authPic,
        leaveState: leaveRequest.leaveState
      })
    );

    return {
      date: resource.date,
      dayOfWeek: resource.dayOfWeek,
      leaveCount: resource.leaveCount,
      availableCount: resource.availableCount,
      employees: employeesWithLeaveRequests,
      holidays: resource.holidays
    };
  });

  return formattedData;
};

export const getTotalLeaveCount = (cardData: TeamAvailabilityDataType[]) => {
  return cardData
    ?.map((data) => data.leaveCount)
    .reduce((acc, curr) => acc + curr, 0);
};

export const getTotalAvailableCount = (
  cardData: TeamAvailabilityDataType[]
) => {
  return cardData
    ?.map((data) => data.availableCount)
    .reduce((acc, curr) => acc + curr, 0);
};

export const getEmployeesWithLeaveRequests = (
  cardData: TeamAvailabilityDataType[]
) => {
  const employeesMap = new Map<
    string,
    TeamAvailabilityDataType["employees"][0]
  >();

  cardData?.forEach((data) => {
    data.employees.forEach((employee) => {
      const employeeKey = `${employee.firstName}-${employee.lastName}`;
      if (!employeesMap.has(employeeKey)) {
        employeesMap.set(employeeKey, employee);
      }
    });
  });

  return Array.from(employeesMap.values());
};

interface FormatSingleDateInfoProps {
  data: TeamAvailabilityDataType;
  employees: TeamAvailabilityDataType["employees"];
  translateText: (key: string[], data?: Record<string, unknown>) => string;
  selectedDates: DateTime[];
}

export const formatSingleDateInfo = ({
  data,
  employees,
  translateText,
  selectedDates
}: FormatSingleDateInfoProps) => {
  if (data?.leaveCount === 0) {
    return translateText(["fullTeamAvailable"]);
  }

  if (data?.availableCount === 0) {
    return translateText(["fullTeamAway"]);
  }

  if (employees?.length === 1) {
    return translateText(["oneEmployeeAwayForSingleDate"], {
      date: formatDayWithOrdinalIndicator(selectedDates[0]),
      employee: employees[0]?.firstName
    });
  }

  if (employees?.length === 2) {
    return translateText(["twoEmployeesAwayForSingleDate"], {
      date: formatDayWithOrdinalIndicator(selectedDates[0]),
      firstEmployee: employees[0]?.firstName,
      secondEmployee: employees[1]?.firstName
    });
  }

  return translateText(["availabilityInfoForSingleDate"], {
    date: formatDayWithOrdinalIndicator(selectedDates[0]),
    firstEmployee: employees[0]?.firstName,
    secondEmployee: employees[1]?.firstName
  });
};

interface FormatMultipleDatesInfoProps {
  totalLeaveCount: number;
  totalAvailableCount: number;
  employees: TeamAvailabilityDataType["employees"];
  translateText: (key: string[], data?: Record<string, unknown>) => string;
  selectedDates: DateTime[];
}

export const formatMultipleDatesInfo = ({
  totalLeaveCount,
  totalAvailableCount,
  employees,
  translateText,
  selectedDates
}: FormatMultipleDatesInfoProps) => {
  if (totalLeaveCount === 0) {
    return translateText(["fullTeamAvailable"]);
  }

  if (totalAvailableCount === 0) {
    return translateText(["fullTeamAway"]);
  }

  if (employees.length === 1) {
    return translateText(["oneEmployeeAwayForMultipleDates"], {
      startDate: formatDayWithOrdinalIndicator(selectedDates[0]),
      endDate: formatDayWithOrdinalIndicator(selectedDates[1]),
      employee: employees[0]?.firstName
    });
  }

  if (employees.length === 2) {
    return translateText(["twoEmployeesAwayForMultipleDates"], {
      startDate: formatDayWithOrdinalIndicator(selectedDates[0]),
      endDate: formatDayWithOrdinalIndicator(selectedDates[1]),
      firstEmployee: employees[0]?.firstName,
      secondEmployee: employees[1]?.firstName
    });
  }

  return translateText(["availabilityInfoForMultipleDates"], {
    startDate: formatDayWithOrdinalIndicator(selectedDates[0]),
    endDate: formatDayWithOrdinalIndicator(selectedDates[1]),
    firstEmployee: employees[0]?.firstName,
    secondEmployee: employees[1]?.firstName
  });
};

interface GetAvailabilityInfoProps {
  selectedDates: DateTime[];
  cardData: TeamAvailabilityDataType[];
  translateText: (key: string[], data?: Record<string, unknown>) => string;
}

export const getAvailabilityInfo = ({
  selectedDates,
  cardData,
  translateText
}: GetAvailabilityInfoProps) => {
  const employees = getEmployeesWithLeaveRequests(cardData);

  if (selectedDates.length === 1) {
    const data = cardData?.[0];

    return formatSingleDateInfo({
      data,
      employees,
      translateText,
      selectedDates
    });
  } else {
    const totalLeaveCount = getTotalLeaveCount(cardData);

    const totalAvailableCount = getTotalAvailableCount(cardData);

    return formatMultipleDatesInfo({
      totalLeaveCount,
      totalAvailableCount,
      employees,
      translateText,
      selectedDates
    });
  }
};
