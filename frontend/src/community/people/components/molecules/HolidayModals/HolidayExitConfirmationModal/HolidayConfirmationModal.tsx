import { ButtonV2 } from "@rootcodelabs/skapp-ui";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { usePeopleStore } from "~community/people/store/store";
import { holidayModalTypes } from "~community/people/types/HolidayTypes";

const HolidayExitConfirmationModal = () => {
  const translateText = useTranslator("peopleModule", "holidays");

  const {
    isBulkUpload,
    setHolidayModalType,
    setIsHolidayModalOpen,
    resetHolidayDetails,
    removeAddedCalendarDetails
  } = usePeopleStore((state) => ({
    isBulkUpload: state.isBulkUpload,
    setHolidayModalType: state.setHolidayModalType,
    setIsHolidayModalOpen: state.setIsHolidayModalOpen,
    resetHolidayDetails: state.resetHolidayDetails,
    removeAddedCalendarDetails: state.removeAddedCalendarDetails
  }));

  const resumeTaskHandler = () => {
    if (isBulkUpload) {
      setHolidayModalType(holidayModalTypes.UPLOAD_HOLIDAY_BULK);
    } else {
      setHolidayModalType(holidayModalTypes.ADD_EDIT_HOLIDAY);
    }
  };

  const leaveBtnOnClick = () => {
    setHolidayModalType(holidayModalTypes.NONE);
    setIsHolidayModalOpen(false);

    if (isBulkUpload) {
      removeAddedCalendarDetails();
    } else {
      resetHolidayDetails();
    }
  };

  return (
    <div>
      <p className="mt-4">
        {translateText(["deletionConfirmDescription"])}
      </p>
      <div className="flex flex-row justify-end gap-3 mt-4">
        <ButtonV2 variant={"primary"} onClick={resumeTaskHandler}>
          {translateText(["deletionConfirmResumeBtn"])}
        </ButtonV2>
        <ButtonV2 variant={"error"} onClick={leaveBtnOnClick}>
          {translateText(["deletionConfirmLeaveAnywayBtn"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default HolidayExitConfirmationModal;
