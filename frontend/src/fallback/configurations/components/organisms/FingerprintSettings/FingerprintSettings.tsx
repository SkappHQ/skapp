import { AttendanceConfigurationType } from "~community/attendance/types/attendanceTypes";

interface Props {
  config: AttendanceConfigurationType | null;
  initialConfig: AttendanceConfigurationType | null;
  onSwitchChange: (
    key: keyof AttendanceConfigurationType,
    checked: boolean
  ) => void;
}

const FingerprintSettings = (_props: Props) => {
  return <></>;
};

export default FingerprintSettings;
