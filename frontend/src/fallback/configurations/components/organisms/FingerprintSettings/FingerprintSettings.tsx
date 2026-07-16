import { FC } from "react";

import { AttendanceConfigurationType } from "~community/attendance/types/attendanceTypes";

interface Props {
  config: AttendanceConfigurationType | null;
  initialConfig: AttendanceConfigurationType | null;
  onSwitchChange: (
    key: keyof AttendanceConfigurationType,
    checked: boolean
  ) => void;
}

const FingerprintSettings: FC<Props> = () => {
  return <></>;
};

export default FingerprintSettings;
