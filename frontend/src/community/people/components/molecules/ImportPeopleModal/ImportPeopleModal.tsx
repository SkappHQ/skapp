import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";

import Icon from "~community/common/components/atoms/Icon/Icon";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useGetGoogleConnectionStatus } from "~community/people/api/GoogleWorkspaceSyncApi";
import { usePeopleStore } from "~community/people/store/store";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";

const ImportPeopleModal = () => {
  const theme = useTheme();
  const router = useRouter();
  const translateText = useTranslator("peopleModule", "peoples");

  const { setIsDirectoryModalOpen, setDirectoryModalType } = usePeopleStore(
    (state) => state
  );

  // Check on open, not just on click — once the org has connected Google
  // Workspace, the first-time import entry point below is retired in favor
  // of the ongoing "Review changes" flow, so we need to know this upfront to
  // render the card as unavailable rather than clickable.
  const { data: connectionStatus, isLoading: isCheckingStatus } =
    useGetGoogleConnectionStatus();
  const isAlreadyConnected = connectionStatus?.connected === true;

  const handleBulkUploadClick = () => {
    setDirectoryModalType(DirectoryModalTypes.DOWNLOAD_CSV);
  };

  const handleGoogleWorkspaceClick = () => {
    if (isCheckingStatus || isAlreadyConnected) return;
    setDirectoryModalType(DirectoryModalTypes.CONNECT_GOOGLE_WORKSPACE);
  };

  const handleReviewChangesClick = () => {
    setIsDirectoryModalOpen(false);
    setDirectoryModalType(DirectoryModalTypes.NONE);
    router.push(ROUTES.PEOPLE.SYNC_CHANGES);
  };

  const optionCardStyles = {
    flex: 1,
    border: `0.0625rem solid ${theme.palette.grey[300]}`,
    borderRadius: "0.75rem",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    textAlign: "center" as const,
    gap: "0.5rem",
    cursor: "pointer",
    transition: "border-color 0.15s, box-shadow 0.15s",
    "&:hover": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 0.1875rem ${theme.palette.secondary.main}`
    }
  };

  return (
    <Stack gap="1.5rem">
      <Typography variant="body2" color="text.secondary">
        {translateText(["googleWorkspaceImport", "selectModalDescription"])}
      </Typography>

      <Stack direction="row" gap="1rem">
        <Box
          onClick={handleBulkUploadClick}
          sx={optionCardStyles}
          role="button"
          tabIndex={0}
        >
          <Icon
            name={IconName.FILE_UPLOAD_ICON}
            fill={theme.palette.text.secondary}
          />
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {translateText(["googleWorkspaceImport", "bulkUploadTitle"])}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {translateText(["googleWorkspaceImport", "bulkUploadDescription"])}
          </Typography>
        </Box>

        <Box
          onClick={handleGoogleWorkspaceClick}
          sx={{
            ...optionCardStyles,
            cursor:
              isCheckingStatus || isAlreadyConnected
                ? "not-allowed"
                : "pointer",
            opacity: isCheckingStatus || isAlreadyConnected ? 0.6 : 1,
            "&:hover":
              isCheckingStatus || isAlreadyConnected
                ? {}
                : optionCardStyles["&:hover"]
          }}
          role="button"
          aria-disabled={isCheckingStatus || isAlreadyConnected}
          tabIndex={0}
        >
          {isCheckingStatus ? (
            <CircularProgress size={40} />
          ) : (
            <Icon name={IconName.GOOGLE_ICON} width="40" height="40" />
          )}
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {translateText(["googleWorkspaceImport", "googleWorkspaceTitle"])}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isAlreadyConnected
              ? translateText([
                  "googleWorkspaceImport",
                  "googleWorkspaceAlreadyConnected"
                ])
              : translateText([
                  "googleWorkspaceImport",
                  "googleWorkspaceDescription"
                ])}
          </Typography>
          {isAlreadyConnected && (
            <Typography
              variant="body2"
              onClick={(e) => {
                e.stopPropagation();
                handleReviewChangesClick();
              }}
              sx={{
                fontWeight: 600,
                color: theme.palette.primary.dark,
                textDecoration: "underline",
                cursor: "pointer"
              }}
            >
              {translateText([
                "googleWorkspaceImport",
                "googleWorkspaceReviewChangesLink"
              ])}
            </Typography>
          )}
        </Box>
      </Stack>
    </Stack>
  );
};

export default ImportPeopleModal;
