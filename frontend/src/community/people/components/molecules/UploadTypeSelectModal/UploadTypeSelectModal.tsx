import { Box, Stack, Typography, useTheme } from "@mui/material";
import { Card } from "@rootcodelabs/skapp-ui";
import { JSX } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
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
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "0.75rem",
        padding: "1.75rem 1.25rem"
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44
        }}
      >
        {icon}
      </Box>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: theme.palette.text.secondary }}
      >
        {description}
      </Typography>
    </Card>
  );
};

const UploadTypeSelectModal = (): JSX.Element => {
  const translateText = useTranslator("peopleModule", "peoples");

  const { setDirectoryModalType } = usePeopleStore((state) => state);

  // Only used to decide whether picking "Import from Google Workspace"
  // should show the OAuth consent screen or jump straight to syncing for an
  // org that's already connected.
  const { isConnected } = useGoogleWorkspaceIntegration(true);

  const handleBulkUploadSelect = (): void => {
    setDirectoryModalType(DirectoryModalTypes.DOWNLOAD_CSV);
  };

  const handleGoogleWorkspaceSelect = (): void => {
    if (isConnected) {
      setDirectoryModalType(DirectoryModalTypes.NONE);
      return;
    }
    setDirectoryModalType(DirectoryModalTypes.CONNECT_GOOGLE_WORKSPACE);
  };

  return (
    <Stack sx={{ gap: "1.25rem" }}>
      <Typography
        variant="body2"
        sx={{ color: (theme) => theme.palette.text.secondary }}
      >
        {translateText(["googleWorkspaceImport", "chooserSubtitle"])}
      </Typography>
      <Stack direction="row" sx={{ gap: "1rem" }}>
        <OptionCard
          icon={<Icon name={IconName.FILE_UPLOAD_ICON} />}
          title={translateText(["googleWorkspaceImport", "bulkUploadTitle"])}
          description={translateText([
            "googleWorkspaceImport",
            "bulkUploadDescription"
          ])}
          onClick={handleBulkUploadSelect}
        />
        <OptionCard
          icon={<Icon name={IconName.GOOGLE_ICON} width="28" height="28" />}
          title={translateText(["googleWorkspaceImport", "googleTitle"])}
          description={translateText([
            "googleWorkspaceImport",
            "googleDescription"
          ])}
          onClick={handleGoogleWorkspaceSelect}
        />
      </Stack>
    </Stack>
  );
};

export default UploadTypeSelectModal;
