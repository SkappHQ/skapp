import { Box, Typography } from "@mui/material";
import { Dispatch, FC, SetStateAction, useState } from "react";

import CloseIcon from "~community/common/assets/Icons/CloseIcon";
import RightArrowIcon from "~community/common/assets/Icons/RightArrowIcon";
import Button from "~community/common/components/atoms/Button/Button";
import DragAndDropField from "~community/common/components/molecules/DragAndDropField/DragAndDropField";
import { ButtonStyle, ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { type FileUploadType } from "~community/common/types/CommonTypes";
import { useAddBulkHolidays } from "~community/people/api/HolidayApi";
import { usePeopleStore } from "~community/people/store/store";
import {
  HolidayType,
  holidayBulkUploadResponse,
  holidayModalTypes
} from "~community/people/types/HolidayTypes";
import { setAttachment } from "~community/people/utils/directoryUtils/holidayBulkUploadUtils/uploadHolidayBulkModalUtils";
import { QuickSetupModalTypeEnums } from "~enterprise/common/enums/Common";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

interface Props {
  setBulkUploadData: Dispatch<
    SetStateAction<holidayBulkUploadResponse | undefined>
  >;
}

const UploadHolidayBulk: FC<Props> = ({ setBulkUploadData }) => {
  const { setToastMessage } = useToast();

  const translateText = useTranslator("peopleModule", "holidays");
  const translateAria = useTranslator("peopleAria", "holiday");

  const {
    newCalenderDetails,
    holidayModalType,
    isNewCalendarDetailsValid,
    selectedYear,
    calendarErrors,
    setCalendarErrors,
    setIsNewCalendarDetailsValid,
    setNewCalendarDetails,
    setHolidayModalType,
    setIsBulkUpload,
    setIsHolidayModalOpen,
    setFailedCount
  } = usePeopleStore((state) => ({
    isNewCalendarDetailsValid: state.isNewCalendarDetailsValid,
    selectedYear: state.selectedYear,
    newCalenderDetails: state.newCalenderDetails,
    holidayModalType: state.holidayModalType,
    calendarErrors: state.calendarErrors,
    setCalendarErrors: state.setCalendarErrors,
    setIsNewCalendarDetailsValid: state.setIsNewCalendarDetailsValid,
    setNewCalendarDetails: state.setNewCalendarDetails,
    setHolidayModalType: state.setHolidayModalType,
    setIsBulkUpload: state.setIsBulkUpload,
    setIsHolidayModalOpen: state.setIsHolidayModalOpen,
    setFailedCount: state.setFailedCount
  }));

  const {
    ongoingQuickSetup,
    setQuickSetupModalType,
    stopAllOngoingQuickSetup
  } = useCommonEnterpriseStore((state) => ({
    ongoingQuickSetup: state.ongoingQuickSetup,
    setQuickSetupModalType: state.setQuickSetupModalType,
    stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
  }));

  const [holidayBulkList, setHolidayBulkList] = useState<HolidayType[]>([]);

  const onSuccess = (response: holidayBulkUploadResponse): void => {
    setBulkUploadData(response);
    if (response.bulkStatusSummary.failedCount > 0) {
      setHolidayModalType(holidayModalTypes.UPLOAD_SUMMARY);
      setFailedCount(response.bulkStatusSummary.failedCount);
      setIsHolidayModalOpen(true);
      if (response.bulkStatusSummary.successCount > 0)
        setToastMessage({
          title: translateText(["uploadSuccessfully"]),
          description: translateText(["holidayCreateSuccessToastDes"], {
            NumberOfHolidays: response.bulkStatusSummary.successCount
          }),
          isIcon: true,
          toastType: ToastType.SUCCESS,
          open: true
        });
      else {
        setToastMessage({
          title: translateText(["uploadFailed"]),
          description: translateText(["uploadFailedDes"]),
          isIcon: true,
          toastType: ToastType.ERROR,
          open: true
        });
      }
    } else {
      setHolidayModalType(holidayModalTypes.NONE);
      if (ongoingQuickSetup.SETUP_HOLIDAYS) {
        setQuickSetupModalType(QuickSetupModalTypeEnums.IN_PROGRESS_START_UP);
        stopAllOngoingQuickSetup();
      }
      setIsHolidayModalOpen(false);
      setToastMessage({
        title: translateText(["holidayCreateSuccessToastTitle"], {
          SelectedYear: selectedYear
        }),
        description: translateText(["holidayCreateSuccessToastDes"], {
          NumberOfHolidays: response.bulkStatusSummary.successCount
        }),
        isIcon: true,
        toastType: ToastType.SUCCESS,
        open: true
      });
    }
    setHolidayBulkList([]);
    setNewCalendarDetails([]);
  };

  const onError = (): void => {
    setIsHolidayModalOpen(false);
    if (ongoingQuickSetup.SETUP_HOLIDAYS) {
      stopAllOngoingQuickSetup();
    }
    setToastMessage({
      title: translateText(["holidayCreateFailTitle"]),
      description: translateText(["holidayCreateFailDes"]),
      isIcon: true,
      toastType: ToastType.ERROR,
      open: true
    });
  };

  const { mutate } = useAddBulkHolidays(onSuccess, onError);

  const handleSaveCalendarBtn = (): void => {
    mutate({ holidayData: holidayBulkList, selectedYear });
    setIsHolidayModalOpen(false);
    setNewCalendarDetails([]);
  };

  const onCloseClick = () => {
    if (
      newCalenderDetails?.acceptedFile?.length !== 0 &&
      holidayModalType === holidayModalTypes.UPLOAD_HOLIDAY_BULK
    ) {
      setIsBulkUpload(true);
      setHolidayModalType(holidayModalTypes.HOLIDAY_EXIT_CONFIRMATION);
    } else {
      setIsHolidayModalOpen(false);
      setHolidayModalType(holidayModalTypes.NONE);
    }
    if (ongoingQuickSetup.SETUP_HOLIDAYS) {
      stopAllOngoingQuickSetup();
    }
  };

  return (
    <Box>
      <Typography
        sx={{
          fontWeight: 400,
          fontSize: "1rem",
          marginBottom: "0.5rem"
        }}
      >
        {translateText(["addCsvTitle"])}
      </Typography>
      <DragAndDropField
        setAttachments={async (acceptedFiles: FileUploadType[]) =>
          await setAttachment({
            acceptedFiles,
            translateText,
            setIsNewCalendarDetailsValid,
            setCalendarErrors,
            setHolidayBulkList,
            setNewCalendarDetails,
            setToastMessage
          })
        }
        accept={{
          "text/csv": [".csv"]
        }}
        uploadableFiles={newCalenderDetails.acceptedFile}
        supportedFiles={".csv"}
        maxFileSize={1}
        customError={calendarErrors}
        accessibility={{
          componentName: translateAria(["holidays"])
        }}
      />

      <Button
        disabled={!isNewCalendarDetailsValid}
        shouldBlink={
          isNewCalendarDetailsValid &&
          newCalenderDetails.acceptedFile?.length > 0
        }
        label={translateText(["UploadHolidays"])}
        endIcon={<RightArrowIcon />}
        buttonStyle={ButtonStyle.PRIMARY}
        styles={{ mt: "1rem" }}
        onClick={() => handleSaveCalendarBtn()}
      />
      <Button
        label={translateText(["cancelBtnText"])}
        endIcon={<CloseIcon />}
        buttonStyle={ButtonStyle.TERTIARY}
        styles={{ mt: "1rem" }}
        onClick={onCloseClick}
      />
    </Box>
  );
};

export default UploadHolidayBulk;
