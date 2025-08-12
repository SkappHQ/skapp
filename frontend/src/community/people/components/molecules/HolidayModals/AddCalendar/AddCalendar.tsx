import { Box, Divider, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";

import DownSideArrow from "~community/common/assets/Icons/DownSideArrow";
import RightArrowIcon from "~community/common/assets/Icons/RightArrowIcon";
import Button from "~community/common/components/atoms/Button/Button";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
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
          label={translateText(["downloadCsvTitle"])}
          buttonStyle={ButtonStyle.SECONDARY}
          styles={{ my: "0.75rem" }}
          endIcon={<DownSideArrow />}
          onClick={downloadTemplateHandler}
          shouldBlink={isButtonBlinking.download}
        />
      </Box>
      <Divider aria-hidden={true} />
      <Button
        label="Next"
        endIcon={<RightArrowIcon />}
        buttonStyle={ButtonStyle.PRIMARY}
        styles={{ mt: "0.75rem" }}
        onClick={() =>
          setHolidayModalType(holidayModalTypes.UPLOAD_HOLIDAY_BULK)
        }
        shouldBlink={isButtonBlinking.next}
      />
    </Box>
  );
};

export default AddCalendar;
