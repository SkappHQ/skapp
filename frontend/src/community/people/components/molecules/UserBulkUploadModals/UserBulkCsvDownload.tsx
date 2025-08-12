import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
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
            <Button
              label={translateText(["downloadCsvButton"])}
              buttonStyle={ButtonStyle.SECONDARY}
              styles={{
                mt: "0.75rem",
                ".MuiButton-endIcon": {
                  "svg path": {
                    fill: "none"
                  }
                }
              }}
              endIcon={IconName.DOWNLOAD_ICON}
              shouldBlink={isDownloadBlinking}
            />
          </a>
        </Box>
      </Box>
      <Button
        label={translateText(["nextButton"])}
        endIcon={IconName.RIGHT_ARROW_ICON}
        buttonStyle={ButtonStyle.PRIMARY}
        styles={{ mb: "0.5rem" }}
        onClick={() => handleNextBtn()}
        shouldBlink={isNextBlinking}
      />
    </Box>
  );
};

export default UserBulkCsvDownload;
