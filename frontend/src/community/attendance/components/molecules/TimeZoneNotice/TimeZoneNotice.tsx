import { FC } from "react";

import { getCurrentTimeZone } from "~community/attendance/utils/TimeUtils";
import {
  useDisplayZone,
  useOrganizationZone
} from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";

const TimeZoneNotice: FC = () => {
  const displayZone = useDisplayZone();
  const organizationZone = useOrganizationZone();
  const translateText = useTranslator("attendanceModule", "timeWidget");

  if (!displayZone || !organizationZone) {
    return null;
  }

  const notices = [
    getCurrentTimeZone() !== displayZone &&
      translateText(["displayZoneNotice"], { displayZone }),
    displayZone !== organizationZone &&
      translateText(["organizationZoneNotice"], { organizationZone })
  ].filter(Boolean);

  if (!notices.length) {
    return null;
  }

  return <p className="text-xs text-secondary-text">{notices.join(" ")}</p>;
};

export default TimeZoneNotice;
