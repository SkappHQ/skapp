import { FC } from "react";

import BirthdayModalController from "~community/people/components/organisms/BirthdayModalController/BirthdayModalController";
import useBirthdayNotifications from "~community/people/hooks/useBirthdayNotifications";

const BirthdayNotificationWrapper: FC = () => {
  const { currentEntry, position, total, onDismiss } =
    useBirthdayNotifications();

  return (
    <BirthdayModalController
      entry={currentEntry}
      position={position}
      total={total}
      onDismiss={onDismiss}
    />
  );
};

export default BirthdayNotificationWrapper;
