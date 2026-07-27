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

const SetHireDateModal: FC<Props> = ({ employeeId, isOpen, onClose }) => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicyAssignment",
    "setHireDateModal"
  );

  const [hireDate, setHireDate] = useState<string>("");

  // Partial employee PATCH — the backend applies each field with setIfExists,
  // so sending only joinedDate updates the hire date and leaves the rest intact.
  const { mutate: editEmployee, isPending } = useEditEmployee(String(employeeId));

  const handleClose = (): void => {
    setHireDate("");
    onClose();
  };

  const handleSave = (): void => {
    if (!hireDate) {
      return;
    }
    const payload: L1EmployeeType = {
      employment: { employmentDetails: { joinedDate: hireDate } }
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
              hireDate ? DateTime.fromISO(hireDate).toJSDate() : undefined
            }
            onSelect={(date?: Date) =>
              setHireDate(
                date ? (DateTime.fromJSDate(date).toISODate() ?? "") : ""
              )
            }
            popperProps={{ position: "bottom-start" }}
          >
            <div>
              <InputField
                name="hireDate"
                value={
                  hireDate
                    ? DateTime.fromISO(hireDate).toJSDate().toLocaleDateString()
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
          disabled: !hireDate || isPending,
          isLoading: isPending,
          children: translateText(["saveBtnTxt"])
        }
      }}
    />
  );
};

export default SetHireDateModal;
