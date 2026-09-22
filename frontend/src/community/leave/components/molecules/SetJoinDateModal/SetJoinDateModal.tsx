import {
  CalendarIcon,
  DatePicker,
  InputField,
  SmallModal
} from "@rootcodelabs/skapp-ui";
import { DateTime } from "luxon";
import { FC, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useEditEmployee } from "~community/people/api/PeopleApi";
import { L1EmployeeType } from "~community/people/types/PeopleTypes";

interface Props {
  employeeId: number;
  isOpen: boolean;
  onClose: () => void;
}

const SetJoinDateModal: FC<Props> = ({ employeeId, isOpen, onClose }) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicyAssignment",
    "setJoinDateModal"
  );

  const [joinDate, setJoinDate] = useState<string>("");

  const { mutate: editEmployee, isPending } = useEditEmployee(
    String(employeeId)
  );

  const handleClose = (): void => {
    setJoinDate("");
    onClose();
  };

  const handleDateSelect = (date?: Date): void => {
    setJoinDate(date ? (DateTime.fromJSDate(date).toISODate() ?? "") : "");
  };

  const handleSave = (): void => {
    if (!joinDate) {
      return;
    }
    const payload: L1EmployeeType = {
      employment: { employmentDetails: { joinedDate: joinDate } }
    };
    editEmployee(payload, { onSuccess: () => handleClose() });
  };

  return (
    <SmallModal
      isOpen={isOpen}
      onClose={handleClose}
      modalHeader={translateText(["title"])}
      content={
        <div className="flex flex-col gap-1.5">
          <p className="body2 text-secondary-text">
            {translateText(["dateLabel"])}
          </p>
          <DatePicker
            mode="single"
            selected={
              joinDate ? DateTime.fromISO(joinDate).toJSDate() : undefined
            }
            onSelect={handleDateSelect}
            popperProps={{ position: "bottom-start" }}
          >
            <div>
              <InputField
                name="joinDate"
                value={
                  joinDate
                    ? DateTime.fromISO(joinDate).toJSDate().toLocaleDateString()
                    : ""
                }
                placeholder={translateText(["datePlaceholder"])}
                aria-label={translateText(["dateLabel"])}
                rightIcon={<CalendarIcon />}
                fullWidth
                readOnly
              />
            </div>
          </DatePicker>
        </div>
      }
      buttons={{
        buttonLeft: {
          variant: "tertiary",
          onClick: handleClose,
          disabled: isPending,
          children: translateText(["cancelBtnTxt"])
        },
        buttonRight: {
          variant: "primary",
          onClick: handleSave,
          disabled: !joinDate || isPending,
          isLoading: isPending,
          children: translateText(["saveBtnTxt"])
        }
      }}
    />
  );
};

export default SetJoinDateModal;
