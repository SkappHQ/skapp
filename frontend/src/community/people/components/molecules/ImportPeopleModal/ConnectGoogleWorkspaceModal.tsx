import { Box, Divider, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useInitiateGoogleConnect } from "~community/people/api/GoogleWorkspaceSyncApi";
import { usePeopleStore } from "~community/people/store/store";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";

const ACCESS_ITEM_KEYS = [
  "connectAccessProfiles",
  "connectAccessOrgUnits",
  "connectAccessStatus"
];

const ConnectGoogleWorkspaceModal = () => {
  const theme = useTheme();
  const translateText = useTranslator("peopleModule", "peoples");

  const { setDirectoryModalType } = usePeopleStore((state) => state);
  const { mutate: initiateConnect, isPending: isConnecting } =
    useInitiateGoogleConnect();

  const handleConnectClick = () => {
    initiateConnect(undefined, {
      onSuccess: (data) => {
        if (data?.url) {
          window.location.href = data.url;
        }
      }
    });
  };

  return (
    <Stack alignItems="center" gap="1rem" sx={{ textAlign: "center" }}>
      <Icon name={IconName.GOOGLE_ICON} width="40" height="40" />

      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {translateText(["googleWorkspaceImport", "connectTitle"])}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: "0.5rem", maxWidth: "23rem" }}
        >
          {translateText(["googleWorkspaceImport", "connectDescription"])}
        </Typography>
      </Box>

      <Stack
        direction="row"
        gap="0.5rem"
        alignItems="flex-start"
        sx={{
          width: "100%",
          backgroundColor: theme.palette.secondary.main,
          borderRadius: "0.5rem",
          padding: "0.75rem 1rem"
        }}
      >
        <Icon name={IconName.INFO_ICON} fill={theme.palette.primary.dark} />
        <Typography
          variant="body2"
          sx={{ color: theme.palette.primary.dark, textAlign: "left" }}
        >
          {translateText(["googleWorkspaceImport", "connectPrivacyNotice"])}
        </Typography>
      </Stack>

      <Box sx={{ width: "100%", textAlign: "left" }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.secondary,
            letterSpacing: "0.05em",
            textTransform: "uppercase"
          }}
        >
          {translateText(["googleWorkspaceImport", "connectAccessHeading"])}
        </Typography>
        <Stack gap="0.5rem" sx={{ mt: "0.5rem" }}>
          {ACCESS_ITEM_KEYS.map((key) => (
            <Stack key={key} direction="row" gap="0.5rem" alignItems="center">
              <Icon
                name={IconName.CHECK_ICON}
                fill={theme.palette.greens.midDark}
              />
              <Typography variant="body2">
                {translateText(["googleWorkspaceImport", key])}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      <Divider sx={{ width: "100%" }} />

      <Stack direction="row" gap="0.75rem" justifyContent="center" sx={{ width: "100%" }}>
        <ButtonV2
          variant="tertiary"
          size="md"
          onClick={() =>
            setDirectoryModalType(DirectoryModalTypes.IMPORT_PEOPLE_SELECT)
          }
        >
          {translateText(["cancelButton"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          size="md"
          isLoading={isConnecting}
          icon={<Icon name={IconName.GOOGLE_ICON} width="18" height="18" />}
          iconPosition="start"
          onClick={handleConnectClick}
        >
          {translateText(["googleWorkspaceImport", "continueWithGoogle"])}
        </ButtonV2>
      </Stack>
    </Stack>
  );
};

export default ConnectGoogleWorkspaceModal;
