import { JSX } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  NotificationDataTypes,
  notificationDefaultImage
} from "~community/common/types/notificationTypes";
import { fromDateToRelativeTime } from "~community/common/utils/dateTimeUtils";
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

  const isViewed =
    item.isViewed ||
    isLeaveModuleDisabled === true ||
    isAttendanceModuleDisabled === true ||
    isEsignatureModuleDisabled === true;

  return (
    <div className="flex flex-row gap-4 w-full py-3 border-b border-secondary-accent hover:cursor-pointer">
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-4 h-9 w-2">
          {!isViewed && (
            <div className="size-2 bg-primary-accent rounded-full" />
          )}
        </div>
        <Avatar
          firstName={""}
          lastName={""}
          alt={item.title}
          src={item.authPic ?? notificationDefaultImage}
          avatarStyles={{ width: 36, height: 36 }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <p className={`body1 ${isViewed ? "text-secondary-icon" : ""}`}>
          {item?.body}
        </p>
        <p className="body3 text-secondary-icon">
          {fromDateToRelativeTime(
            item.createdDate,
            translateText,
            i18n.language
          )}
        </p>
      </div>
    </div>
  );
};

export default NotificationContent;
