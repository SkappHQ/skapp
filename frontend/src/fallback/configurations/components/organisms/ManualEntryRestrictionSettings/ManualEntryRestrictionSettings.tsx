import { FC } from "react";

import { AttendanceConfigurationType } from "~community/attendance/types/attendanceTypes";

interface Props {
  config: AttendanceConfigurationType | null;
  initialConfig: AttendanceConfigurationType | null;
  onSaved: (checked: boolean) => void;
}

const ManualEntryRestrictionSettings: FC<Props> = () => {
  return <></>;
};

export default ManualEntryRestrictionSettings;
