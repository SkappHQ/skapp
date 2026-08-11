import { FC } from "react";

import ColleagueBirthdayModal from "~community/people/components/molecules/BirthdayModals/ColleagueBirthdayModal";
import SelfBirthdayModal from "~community/people/components/molecules/BirthdayModals/SelfBirthdayModal";
import { BirthdayModalVariant } from "~community/people/enums/BirthdayNotificationEnums";
import useBirthdayNotifications from "~community/people/hooks/useBirthdayNotifications";

const BirthdayModalController: FC = () => {
  const { currentEntry: entry, position, total, onDismiss } =
    useBirthdayNotifications();

  if (!entry) {
    return null;
  }

  if (entry.variant === BirthdayModalVariant.SELF) {
    return (
      <SelfBirthdayModal
        key={entry.employee.employeeId}
        employee={entry.employee}
        position={position}
        total={total}
        onDismiss={onDismiss}
      />
    );
  }

  return (
    <ColleagueBirthdayModal
      key={entry.employee.employeeId}
      employee={entry.employee}
      position={position}
      total={total}
      onDismiss={onDismiss}
    />
  );
};

export default BirthdayModalController;
