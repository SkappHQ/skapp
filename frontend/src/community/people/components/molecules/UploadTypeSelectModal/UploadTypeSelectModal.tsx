import { Box, Stack, Typography, useTheme } from "@mui/material";
import { Card } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { JSX } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useGoogleWorkspaceIntegration } from "~community/people/hooks/useGoogleWorkspaceIntegration";
import { usePeopleStore } from "~community/people/store/store";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";

interface OptionCardProps {
  icon: JSX.Element;
  title: string;
  description: string;
  onClick: () => void;
}

const OptionCard = ({
  icon,
  title,
  description,
  onClick
}: OptionCardProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Card
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className="cursor-pointer"
      style={{
        width: "379.5px",
        height: "368px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        gap: "32px",
        padding: "4px 0",
        borderRadius: "12px"
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 64
        }}
      >
        {icon}
      </Box>
      <Stack
        sx={{ gap: "1rem", alignItems: "center", width: "292px", height: "80px" }}
      >
        <Typography
          variant="body1"
          sx={{ fontWeight: 500, lineHeight: "16px" }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: theme.palette.text.secondary, lineHeight: "150%" }}
        >
          {description}
        </Typography>
      </Stack>
    </Card>
  );
};

const UploadTypeSelectModal = (): JSX.Element => {
  const router = useRouter();
  const translateText = useTranslator("peopleModule", "peoples");

  const { setIsDirectoryModalOpen, setDirectoryModalType } = usePeopleStore(
    (state) => state
  );

  // Only used to decide whether picking "Import from Google Workspace"
  // should show the OAuth consent screen or jump straight to reviewing
  // members for an org that's already connected.
  const { isConnected } = useGoogleWorkspaceIntegration(true);

  const handleBulkUploadSelect = (): void => {
    setDirectoryModalType(DirectoryModalTypes.DOWNLOAD_CSV);
  };

  const handleGoogleWorkspaceSelect = (): void => {
    if (isConnected) {
      setIsDirectoryModalOpen(false);
      setDirectoryModalType(DirectoryModalTypes.NONE);
      router.push(ROUTES.PEOPLE.GOOGLE_IMPORT_REVIEW);
      return;
    }
    setDirectoryModalType(DirectoryModalTypes.CONNECT_GOOGLE_WORKSPACE);
  };

  return (
    <Stack direction="row" sx={{ gap: "1rem" }}>
        <OptionCard
          icon={
            <Icon
              name={IconName.SCAN_DOCUMENT_ICON}
              width="64"
              height="64"
            />
          }
          title={translateText(["googleWorkspaceImport", "bulkUploadTitle"])}
          description={translateText([
            "googleWorkspaceImport",
            "bulkUploadDescription"
          ])}
          onClick={handleBulkUploadSelect}
        />
        <OptionCard
          icon={
            <Icon
              name={IconName.GOOGLE_ICON}
              width="64"
              height="64"
            />
          }
          title={translateText(["googleWorkspaceImport", "googleTitle"])}
          description={translateText([
            "googleWorkspaceImport",
            "googleDescription"
          ])}
          onClick={handleGoogleWorkspaceSelect}
        />
    </Stack>
  );
};

export default UploadTypeSelectModal;
