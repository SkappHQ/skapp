import { AttendanceConfigurationType } from "~community/attendance/types/attendanceTypes";

interface Props {
  config: AttendanceConfigurationType | null;
  initialConfig: AttendanceConfigurationType | null;
  onSwitchChange: (
    key: keyof AttendanceConfigurationType,
    checked: boolean
  ) => void;
}

const GeoFencingSettings = ({
  config,
  initialConfig,
  onSwitchChange
}: Props) => {
  return <></>;
};

export default GeoFencingSettings;
