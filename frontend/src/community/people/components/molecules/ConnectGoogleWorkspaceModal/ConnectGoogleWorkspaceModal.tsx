import { Box, Stack, Typography, useTheme } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { JSX, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { IconName } from "~community/common/types/IconTypes";
import authFetch from "~community/common/utils/axiosInterceptor";
import { getApiUrl } from "~community/common/utils/getConstants";
import { usePeopleStore } from "~community/people/store/store";
import { DirectoryModalTypes } from "~community/people/types/ModalTypes";

const ConnectGoogleWorkspaceModal = (): JSX.Element => {
  const theme = useTheme();
  const translateText = useTranslator("peopleModule", "peoples");
  const { setToastMessage } = useToast();
  const { setDirectoryModalType } = usePeopleStore((state) => state);

  const [isConnecting, setIsConnecting] = useState(false);

  const accessItems = [
    translateText(["googleWorkspaceImport", "connectAccessProfiles"]),
    translateText(["googleWorkspaceImport", "connectAccessOUs"]),
    translateText(["googleWorkspaceImport", "connectAccessStatus"])
  ];

  const handleCancel = (): void => {
    setDirectoryModalType(DirectoryModalTypes.NONE);
  };

  const handleContinueWithGoogle = async (): Promise<void> => {
    setIsConnecting(true);
    try {
      // authFetch's baseURL already carries "/v1" for the rest of the app's
      // routes; the integrations API lives at "/api/v1" instead, so this
      // must be requested as an absolute URL or it would resolve under
      // "/v1/api/v1/...".
      const response = await authFetch.get(
        `${getApiUrl()}/api/v1/integrations/google/initiate`
      );
      if (response?.data?.url) {
        window.location.href = response.data.url;
        return;
      }
      throw new Error("Missing redirect URL");
    } catch {
      setToastMessage({
        open: true,
        toastType: ToastType.ERROR,
        title: translateText(["googleWorkspaceImport", "connectErrorTitle"]),
        description: translateText([
          "googleWorkspaceImport",
          "connectErrorDescription"
        ])
      });
      setIsConnecting(false);
    }
  };

  return (
    <Stack sx={{ gap: "1.25rem", alignItems: "center", textAlign: "center" }}>
      <Icon name={IconName.GOOGLE_ICON} width="48" height="48" />

      <Typography
        variant="body2"
        sx={{ color: theme.palette.text.secondary }}
      >
        {translateText(["googleWorkspaceImport", "connectDescription"])}
      </Typography>

      <Stack
        direction="row"
        sx={{
          width: "100%",
          gap: "0.5rem",
          alignItems: "center",
          textAlign: "left",
          backgroundColor: theme.palette.secondary.main,
          borderRadius: "8px",
          padding: "0.5rem 1rem"
        }}
      >
        <Box
          sx={{
            display: "flex",
            "& svg path": { fill: theme.palette.primary.dark }
          }}
        >
          <Icon name={IconName.WARNING_SIGN_ICON} />
        </Box>
        <Typography
          variant="body2"
          sx={{ color: theme.palette.primary.dark }}
        >
          {translateText([
            "googleWorkspaceImport",
            "connectPrivacyNotice"
          ])}
        </Typography>
      </Stack>

      <Stack sx={{ width: "100%", gap: "0.5rem", textAlign: "left" }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 400,
            fontSize: "13px",
            color: theme.palette.text.secondary
          }}
        >
          {translateText(["googleWorkspaceImport", "connectAccessListTitle"])}
        </Typography>
        {accessItems.map((item) => (
          <Stack
            key={item}
            direction="row"
            sx={{ gap: "0.5rem", alignItems: "center" }}
          >
            <Icon name={IconName.SUCCESS_TICK_ICON} width="16" height="16" />
            <Typography variant="body2">{item}</Typography>
          </Stack>
        ))}
      </Stack>

      <Stack
        direction="row"
        sx={{ width: "100%", gap: "0.75rem", justifyContent: "flex-end" }}
      >
        <Box sx={{ flex: 1 }} />
        <ButtonV2
          variant="tertiary"
          size="md"
          onClick={handleCancel}
          disabled={isConnecting}
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {translateText(["cancelButton"])}
        </ButtonV2>
        <ButtonV2
          variant="primary"
          size="md"
          isLoading={isConnecting}
          onClick={handleContinueWithGoogle}
        >
          {translateText(["googleWorkspaceImport", "continueWithGoogle"])}
        </ButtonV2>
      </Stack>
    </Stack>
  );
};

export default ConnectGoogleWorkspaceModal;
