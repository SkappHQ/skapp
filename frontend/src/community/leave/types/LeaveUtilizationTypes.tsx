export interface GraphTraverseTypes {
  min: number;
  max: number;
}

export type TotalLeavesWithTypes = {
  leaveUtilizationData: Record<string, number>;
  leaveTrendData?: Record<string, number>;
  leaveType: {
    colorCode: string;
    emoji: string;
    name: string;
    leaveId: number;
  };
};

export type LeaveTypeBreakdownResponseType = {
  totalLeaves: Record<string, number>;
  totalLeavesWithType: TotalLeavesWithTypes[];
};

export type ToggleState = Record<string, boolean>;
export type SelectedFiltersTypes = Record<string, boolean>;

export type LeaveTypeBreakDownReturnTypes = {
  data: DataSeriesType[];
  labels: string[];
  toggle: Record<string, boolean>;
  months?: string[];
};

type DataSeriesType = {
  name: string;
  type: string;
  data: number[];
  color: string;
  emphasis: {
    focus: string;
  };
};
