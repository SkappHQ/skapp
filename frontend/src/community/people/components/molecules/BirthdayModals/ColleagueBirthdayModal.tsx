import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import BirthdayModalShell from "~community/people/components/molecules/BirthdayModals/BirthdayModalShell";
import { EmployeeBirthdayType } from "~community/people/types/BirthdayNotificationTypes";

const MODAL_ID = "birthday-colleague";

interface Props {
  employee: EmployeeBirthdayType;
  position: number;
  total: number;
  onDismiss: () => void;
}

const ColleagueBirthdayModal: FC<Props> = ({
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
      heading={translateText(["colleague", "heading"], {
        name: employee.firstName
      })}
      body={translateText(["colleague", "body"])}
      position={position}
      total={total}
      onDismiss={onDismiss}
    />
  );
};

export default ColleagueBirthdayModal;
