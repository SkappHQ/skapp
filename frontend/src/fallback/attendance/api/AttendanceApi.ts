import { EpAddTimeRecordDto } from "~enterprise/attendance/api/AttendanceApi";

export const useUpdateEmployeeStatusWithLocation = () => {
  return {
    mutate: (_: EpAddTimeRecordDto) => {},
    isPending: false
  };
};
