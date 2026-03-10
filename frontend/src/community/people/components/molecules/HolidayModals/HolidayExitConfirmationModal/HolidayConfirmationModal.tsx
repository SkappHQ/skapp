import { Box, Typography } from "@mui/material";

import { Button } from "@rootcodelabs/skapp-ui";

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
    <Box>
      <Typography sx={{ mt: "1rem" }}>
        {translateText(["deletionConfirmDescription"])}
      </Typography>
      <Box>
        <Button variant={"primary"} onClick={resumeTaskHandler}>{translateText(["deletionConfirmResumeBtn"])}</Button>
        <Button variant={"error"} onClick={leaveBtnOnClick}>{translateText(["deletionConfirmLeaveAnywayBtn"])}</Button>
      </Box>
    </Box>
  );
};

export default HolidayExitConfirmationModal;
