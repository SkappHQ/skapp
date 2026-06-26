export type CustomLabelSeriesType =
  | {
      value: number;
      label: {
        show: boolean;
        position: string;
        formatter: string;
        fontFamily: string;
        backgroundColor: string;
        borderRadius: number;
        padding: [number, number];
        fontSize: number;
        color: string;
      };
    }
  | number;

export type LineChartLineTypes = "solid" | "dashed" | "doted";

export interface CustomSeriesType {
  name: string;
  type: string;
  smooth: boolean;
  data: CustomLabelSeriesType[];
  lineStyle: {
    width: number;
    type: LineChartLineTypes;
    color: string;
  };
  itemStyle: {
    color: string;
  };
}

export interface LeaveTypeSeriesTypes {
  leaveTypeName: string;
  color: string;
  selected: boolean;
}

export interface LeaveTrendReturnTypes {
  leaveChartDataSeries: CustomSeriesType[];
  leaveTypeForYearDataSeries: LeaveTypeSeriesTypes[];
  months?: string[];
}

export type SelectedFiltersTypes = Record<string, boolean>;

export interface GraphTraverseTypes {
  min: number;
  max: number;
}

export type ToggleState = Record<string, boolean>;

type Team = {
  isSupervisor: boolean | null;
  teamId: number;
  teamName: string;
};

type TeamWrapper = {
  team: Team;
};

export type EmployeeResponseDto = {
  employeeId: number;
  firstName: string;
  lastName: string;
  accountStatus: string;
  middleName: string | null;
  address: string | null;
  addressLine2: string | null;
  designation: string | null;
  authPic: string;
  identificationNo: string | null;
  email: string | null;
  jobTitle: string | null;
  jobFamilyDto: any | null;
  probationPeriod: string | null;
  employmentAllocation: any | null;
  employmentStatus: string;
  country: string | null;
  personalEmail: string | null;
  phone: string;
  gender: string | null;
  employeeProgressions: null;
  eeo: string | null;
  ethnicity: string | null;
  teams: TeamWrapper[];
  employeeVisas: null;
  employeeEmergencies: null;
  employeePersonalInfo: null;
  employeeEducations: [];
  employeeFamilies: [];
  userRole: null;
};

type LeaveType = {
  typeId: number;
  name: string;
  emojiCode: string;
  colorCode: string;
};

type LeaveRequestResponseDto = {
  leaveRequestId: number;
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  leaveState: string;
  status: string;
  isViewed: boolean;
  durationDays: number;
  requestDesc: string;
  createdDate: string;
};

export interface LeaveHistoryRowType {
  employeeResponseDto: EmployeeResponseDto;
  leaveRequestResponseDto: LeaveRequestResponseDto;
}

export interface LeaveHistoryDataTypes {
  currentPage: number;
  items: LeaveHistoryRowType[];
  totalItems: number;
  totalPages: number;
}

export interface DownloadDataAsCSVType {
  data: LeaveHistoryRowType[];
}

export type APIResponseDataType<T = any> = {
  results: APIResponseResultType<T>[];
  status: string;
};

export type APIResponseResultType<T = any> = T extends object
  ? T
  : Record<string, T>;

export interface LeaveTrendForYearResponseType {
  totalLeaves: Record<string, number>;
  totalLeavesWithType: TotalLeavesWithTypes[];
}

export type TotalLeavesWithTypes = {
  leaveUtilizationData: Record<string, number>;
  leaveTrendData?: Record<string, number>;
  leaveType: {
    colorCode: string;
    emojiCode: string;
    name: string;
    leaveId: number;
  };
};

export type SelectedTypeCountTypes = "ALL" | number;

export type Employee = {
  employee: EmployeeResponseDto;
  isSupervisor: boolean;
};

export interface TeamResults {
  teamId: number;
  teamName: string;
  employees: Employee[];
}
