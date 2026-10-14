import { JSX } from "react";

import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  NotificationDataTypes,
  notificationDefaultImage
} from "~community/common/types/notificationTypes";
import { fromDateToRelativeTime } from "~community/common/utils/dateTimeUtils";
import { getNotificationIcon } from "~community/common/utils/notificationUtils";
import i18n from "~i18n";

import Avatar from "../Avatar/Avatar";

interface Props {
  item: NotificationDataTypes;
  isLeaveModuleDisabled?: boolean;
  isAttendanceModuleDisabled?: boolean;
  isEsignatureModuleDisabled?: boolean;
}

const NotificationContent = ({
  item,
  isLeaveModuleDisabled,
  isAttendanceModuleDisabled,
  isEsignatureModuleDisabled
}: Props): JSX.Element => {
  const translateText = useTranslator("notifications");
  const displayZone = useDisplayZone();

  const isViewed =
    item.isViewed ||
    isLeaveModuleDisabled === true ||
    isAttendanceModuleDisabled === true ||
    isEsignatureModuleDisabled === true;

  const IconComponent = getNotificationIcon(item.notificationType);

  return (
    <div className="flex w-full flex-row gap-4 border-b border-secondary-accent py-3 hover:cursor-pointer hover:bg-tertiary-background">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-2 items-center gap-4">
          {!isViewed && (
            <div className="size-2 rounded-full bg-primary-accent" />
          )}
        </div>
        {IconComponent ? (
          <div className="flex size-9 items-center justify-center rounded-full border-[0.38px] border-tertiary-background bg-white">
            <IconComponent width="24" height="24" />
          </div>
        ) : (
          <Avatar
            firstName={""}
            lastName={""}
            alt={item.title}
            src={item.authPic ?? notificationDefaultImage}
            avatarStyles={{ width: 36, height: 36 }}
          />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className={`subtitle1 ${isViewed ? "text-secondary-icon" : ""}`}>
          {item?.body}
        </p>
        <p className="body3 text-secondary-icon">
          {fromDateToRelativeTime(
            item.createdDate,
            translateText,
            i18n.language,
            displayZone
          )}
        </p>
      </div>
    </div>
  );
};

export default NotificationContent;
