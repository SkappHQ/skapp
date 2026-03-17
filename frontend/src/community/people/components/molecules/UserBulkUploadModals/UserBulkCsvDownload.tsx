import { Box, Typography } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { useEffect, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { getBlinkClass } from "~community/common/utils/commonUtil";
import { usePeopleStore } from "~community/people/store/store";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";
import { userBulkTemplate } from "~community/people/utils/getConstants";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

const UserBulkCsvDownload = () => {
  const { setIsDirectoryModalOpen, setDirectoryModalType } = usePeopleStore(
    (state) => state
  );
  const translateText = useTranslator("peopleModule", "peoples");

  const handleNextBtn = () => {
    setIsDirectoryModalOpen(true);
    setDirectoryModalType(DirectoryModalTypes.UPLOAD_CSV);
  };

  const { ongoingQuickSetup } = useCommonEnterpriseStore((state) => ({
    ongoingQuickSetup: state.ongoingQuickSetup
  }));

  const [isDownloadBlinking, setIsDownloadBlinking] = useState(false);
  const [isNextBlinking, setIsNextBlinking] = useState(false);

  useEffect(() => {
    if (ongoingQuickSetup.INVITE_EMPLOYEES) {
      setIsDownloadBlinking(true);
    }
  }, [ongoingQuickSetup]);

  const handleDownloadClick = () => {
    if (ongoingQuickSetup.INVITE_EMPLOYEES) {
      setIsDownloadBlinking(false);
      setIsNextBlinking(true);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          borderRadius: "0.75rem",
          height: "100%"
        }}
      >
        <Typography
          id="download-csv-description"
          sx={{
            fontSize: "1rem",
            fontWeight: 400,
            p: "0rem 0.75rem 0.75rem 0.75rem",
            borderRadius: "0.75rem"
          }}
        >
          {translateText(["downloadCsvDes"])}
        </Typography>
        <Box
          sx={{
            mb: "1rem"
          }}
        >
          <a
            href={userBulkTemplate.url}
            download={userBulkTemplate.fileName}
            target="_blank"
            rel="noreferrer"
            onClick={handleDownloadClick}
            tabIndex={-1}
          >
            <ButtonV2
              variant={"secondary"}
              className={getBlinkClass(isDownloadBlinking)}
              icon={<Icon name={IconName.DOWNLOAD_ICON} />}
              iconPosition="end"
            >
              {translateText(["downloadCsvButton"])}
            </ButtonV2>
          </a>
        </Box>
      </Box>
      <ButtonV2
        variant={"primary"}
        onClick={() => handleNextBtn()}
        className={getBlinkClass(isNextBlinking)}
        icon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
        iconPosition="end"
      >
        {translateText(["nextButton"])}
      </ButtonV2>
    </Box>
  );
};

export default UserBulkCsvDownload;
