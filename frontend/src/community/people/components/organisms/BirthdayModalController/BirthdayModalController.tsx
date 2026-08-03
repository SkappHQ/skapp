import { FC } from "react";

import ColleagueBirthdayModal from "~community/people/components/molecules/ColleagueBirthdayModal/ColleagueBirthdayModal";
import SelfBirthdayModal from "~community/people/components/molecules/SelfBirthdayModal/SelfBirthdayModal";
import { BirthdayModalVariant } from "~community/people/enums/BirthdayNotificationEnums";
import { BirthdayQueueEntryType } from "~community/people/types/BirthdayNotificationTypes";

interface Props {
  entry: BirthdayQueueEntryType | null;
  position: number;
  total: number;
  onDismiss: () => void;
}

const BirthdayModalController: FC<Props> = ({
  entry,
  position,
  total,
  onDismiss
}) => {
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
