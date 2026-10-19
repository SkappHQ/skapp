import {
  CalendarIcon,
  DatePicker,
  InputField,
  SmallModal
} from "@rootcodelabs/skapp-ui";
import { DateTime } from "luxon";
import { FC, useState } from "react";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { useEditEmployeeJoinedDate } from "~community/people/api/PeopleApi";

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

  const translateToast = useTranslator("peopleModule", "addResource");
  const { setToastMessage } = useToast();

  const [joinDate, setJoinDate] = useState<string>("");

  const handleClose = (): void => {
    setJoinDate("");
    onClose();
  };

  const handleSaveSuccess = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateToast(["editToastTitle"]),
      description: translateToast(["editToastDescription"])
    });
    handleClose();
  };

  const handleSaveError = (): void => {
    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateToast(["editErrorToastTitle"]),
      description: translateToast(["editErrorToastDescription"])
    });
  };

  const { mutate: editJoinedDate, isPending } = useEditEmployeeJoinedDate(
    employeeId,
    handleSaveSuccess,
    handleSaveError
  );

  const handleDateSelect = (date?: Date): void => {
    setJoinDate(date ? (DateTime.fromJSDate(date).toISODate() ?? "") : "");
  };

  const handleSave = (): void => {
    if (!joinDate) {
      return;
    }
    editJoinedDate({ joinedDate: joinDate });
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
