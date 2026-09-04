import { FC } from "react";

import {
  useBusinessZone,
  useDisplayZone
} from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";

const TimeZoneNotice: FC = () => {
  const displayZone = useDisplayZone();
  const businessZone = useBusinessZone();
  const translateText = useTranslator("attendanceModule", "timeWidget");

  if (!displayZone || !businessZone || displayZone === businessZone) {
    return null;
  }

  return (
    <p className="text-xs text-secondary-text">
      {translateText(["timeZoneNotice"], { displayZone, businessZone })}
    </p>
  );
};

export default TimeZoneNotice;
