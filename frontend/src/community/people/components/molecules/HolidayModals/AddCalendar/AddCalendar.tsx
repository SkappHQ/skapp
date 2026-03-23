import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, useEffect, useState } from "react";

import DownSideArrow from "~community/common/assets/Icons/DownSideArrow";
import RightArrowIcon from "~community/common/assets/Icons/RightArrowIcon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { getBlinkClass } from "~community/common/utils/commonUtil";
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
    <div>
      <div>
        <p
          id="download-csv-description"
        >
          {translateText(["downloadCsvDes"])}
        </p>
        <ButtonV2
          variant={"secondary"}
          onClick={downloadTemplateHandler}
          className={getBlinkClass(isButtonBlinking.download)}
          icon={<DownSideArrow />}
          iconPosition="end"
        >
          {translateText(["downloadCsvTitle"])}
        </ButtonV2>
      </div>
      <hr />
      <div className="flex flex-row justify-end gap-3 mt-4">
        <ButtonV2
          variant={"primary"}
          onClick={() =>
            setHolidayModalType(holidayModalTypes.UPLOAD_HOLIDAY_BULK)
          }
          className={getBlinkClass(isButtonBlinking.next)}
          icon={<RightArrowIcon />}
          iconPosition="end"
        >
          {translateText(["nextBtn"])}
        </ButtonV2>
      </div>
    </div>
  );
};

export default AddCalendar;
