import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import BirthdayModalShell from "~community/people/components/molecules/BirthdayModalShell/BirthdayModalShell";
import { EmployeeBirthdayType } from "~community/people/types/BirthdayNotificationTypes";
import { getFullName } from "~community/people/utils/birthdayNotificationUtils";

const MODAL_ID = "birthday-self";

interface Props {
  employee: EmployeeBirthdayType;
  position: number;
  total: number;
  onDismiss: () => void;
}

const SelfBirthdayModal: FC<Props> = ({
  employee,
  position,
  total,
  onDismiss
}) => {
  const translateText = useTranslator("peopleModule", "birthdayNotifications");

  return (
    <BirthdayModalShell
      id={MODAL_ID}
      employee={employee}
      heading={translateText(["self", "heading"], {
        name: getFullName(employee)
      })}
      body={translateText(["self", "body"])}
      position={position}
      total={total}
      onDismiss={onDismiss}
    />
  );
};

export default SelfBirthdayModal;
