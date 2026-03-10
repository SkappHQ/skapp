import { Box, Divider, Typography } from "@mui/material";
import { Button } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useState } from "react";

import DownSideArrow from "~community/common/assets/Icons/DownSideArrow";
import RightArrowIcon from "~community/common/assets/Icons/RightArrowIcon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { usePeopleStore } from "~community/people/store/store";
import { holidayModalTypes } from "~community/people/types/HolidayTypes";
import { downloadBulkCsvTemplate } from "~community/people/utils/directoryUtils/holidayBulkUploadUtils/downloadHolidayBulkTemplateModalUtils";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

const AddCalendar: FC = () => {
  const translateText = useTranslator("peopleModule", "holidays");

  const { setHolidayModalType, setIsBulkUpload } = usePeopleStore((state) => ({
    setHolidayModalType: state.setHolidayModalType,
    setIsBulkUpload: state.setIsBulkUpload
  }));

  const { ongoingQuickSetup } = useCommonEnterpriseStore((state) => ({
    ongoingQuickSetup: state.ongoingQuickSetup
  }));

  const [isButtonBlinking, setIsButtonBlinking] = useState<
    Record<string, boolean>
  >({
    download: false,
    next: false
  });

  useEffect(() => {
    if (ongoingQuickSetup.SETUP_HOLIDAYS) {
      setIsButtonBlinking({ download: true, next: false });
    }
  }, [ongoingQuickSetup]);

  const downloadTemplateHandler = (): void => {
    downloadBulkCsvTemplate();
    setIsBulkUpload(true);

    if (ongoingQuickSetup.SETUP_HOLIDAYS) {
      setIsButtonBlinking({ download: false, next: true });
    }
  };

  return (
    <Box>
      <Box>
        <Typography
          id="download-csv-description"
          variant="body1"
          sx={{
            py: "1rem",
            borderRadius: "0.75rem"
          }}
        >
          {translateText(["downloadCsvDes"])}
        </Typography>
        <Button
          variant={"secondary"}
          onClick={downloadTemplateHandler}
          className={isButtonBlinking.download ? "animate-pulse" : ""}
          icon={<DownSideArrow />}
          iconPosition="end"
        >
          {translateText(["downloadCsvTitle"])}
        </Button>
      </Box>
      <Divider aria-hidden={true} />
      <Button
        variant={"primary"}
        onClick={() =>
          setHolidayModalType(holidayModalTypes.UPLOAD_HOLIDAY_BULK)
        }
        className={isButtonBlinking.next ? "animate-pulse" : ""}
        icon={<RightArrowIcon />}
        iconPosition="end"
      >
        "Next"
      </Button>
    </Box>
  );
};

export default AddCalendar;
