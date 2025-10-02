import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import {
  Box,
  Divider,
  type Theme,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { useSession } from "next-auth/react";
import { FC, ReactNode } from "react";

import { useGetEmailServerConfig } from "~community/common/api/settingsApi";
import { appModes } from "~community/common/constants/configs";
import { GlobalLoginMethod } from "~community/common/enums/CommonEnums";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";
import {
  ManagerTypes,
  ROLE_SUPER_ADMIN
} from "~community/common/types/AuthTypes";
import { IconName } from "~community/common/types/IconTypes";
import { SettingsModalTypes } from "~community/common/types/SettingsTypes";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";
import ManageSubscriptionSettingsSection from "~enterprise/settings/components/molecules/ManageSubscriptionSettingsSection/ManageSubscriptionSettingsSection";

import Button from "../../atoms/Button/Button";
import NotificationSettings from "../../molecules/NotificationSettinngs/NotificationSettinngs";

interface SettingsSectionProps {
  customSettingsComponent?: ReactNode;
}

const SettingsSection: FC<SettingsSectionProps> = ({ customSettingsComponent }) => {
  const translatedText = useTranslator("settings");

  const theme: Theme = useTheme();

  const isLargeScreen: boolean = useMediaQuery(theme.breakpoints.down("lg"));

  const { data: session } = useSession();

  const { setModalType, setModalOpen } = useCommonStore((state) => state);

  const isEnterpriseMode = useGetEnvironment() === appModes.ENTERPRISE;

  const { data: config } = useGetEmailServerConfig(isEnterpriseMode);

  const managerRoles = Object.values(ManagerTypes);

  const hasManagerRole = session?.user?.roles
    ?.filter((role): role is ManagerTypes =>
      managerRoles.includes(role as ManagerTypes)
    )
    .some((role) => managerRoles.includes(role));

  const { globalLoginMethod } = useCommonEnterpriseStore((state) => ({
    globalLoginMethod: state.globalLoginMethod
  }));

  return (
    <>
      {hasManagerRole && (
        <>
          <NotificationSettings /> <Divider />
        </>
      )}

      {session?.user?.roles?.includes(ROLE_SUPER_ADMIN) && (
        <>
          {process.env.NEXT_PUBLIC_MODE !== "enterprise" && (
            <>
              <Box sx={{ py: "1.5rem" }}>
                <Typography variant="h2" sx={{ pb: "0.75rem" }}>
                  {translatedText(["emailServerSettingsTitle"])}
                </Typography>

                <Typography variant="body1">
                  {translatedText(["emailServerSettingsDescription"])}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                    flexDirection: isLargeScreen ? "column" : "row",
                    gap: "0.75rem",
                    mt: "1.25rem"
                  }}
                >
                  <Button
                    label={translatedText(["setupEmailServerButtonText"])}
                    startIcon={<MailOutlineIcon />}
                    isFullWidth={false}
                    styles={{
                      mt: "1.25rem",
                      px: "1.75rem",
                      width: "max-content"
                    }}
                    buttonStyle={ButtonStyle.TERTIARY}
                    onClick={() => {
                      setModalType(SettingsModalTypes.SETUP_EMAIL_SERVER);
                      setModalOpen(true);
                    }}
                  />
                  {config?.emailServiceProvider !== null && (
                    <Button
                      label={translatedText(["testEmailServerButtonText"])}
                      startIcon={<DraftsOutlinedIcon />}
                      isFullWidth={false}
                      styles={{
                        mt: "1.25rem",
                        px: "1.75rem",
                        width: "max-content"
                      }}
                      buttonStyle={ButtonStyle.TERTIARY}
                      onClick={() => {
                        setModalType(SettingsModalTypes.TEST_EMAIL_SERVER);
                        setModalOpen(true);
                      }}
                    />
                  )}
                </Box>
              </Box>

              <Divider />
            </>
          )}

          {customSettingsComponent && (
            <>
              {customSettingsComponent}        
            </>
          )}

          <Box sx={{ py: "1.5rem" }}>
            <Typography variant="h2" sx={{ pb: "0.75rem" }}>
              {translatedText(["organizationSettingsTitle"])}
            </Typography>

            <Typography variant="body1">
              {translatedText(["organizationSettingsDescription"])}
            </Typography>
            <Box
              sx={{
                display: "flex",
                width: "100%",
                flexDirection: isLargeScreen ? "column" : "row",
                gap: "0.75rem",
                mt: "1.25rem"
              }}
            >
              <Button
                label={translatedText(["organizationDetailsButtonText"])}
                startIcon={IconName.WRENCH_ICON}
                styles={{
                  width: "max-content",
                  px: "1.75rem"
                }}
                buttonStyle={ButtonStyle.TERTIARY}
                onClick={() => {
                  setModalType(SettingsModalTypes.CHANGE_ORGANIZATION_SETTINGS);
                  setModalOpen(true);
                }}
              />
              <Button
                label={translatedText(["brandingSettingsButtonText"])}
                startIcon={IconName.PAINT_TRAY_ICON}
                styles={{
                  width: "max-content",
                  px: "1.75rem"
                }}
                buttonStyle={ButtonStyle.TERTIARY}
                onClick={() => {
                  setModalType(SettingsModalTypes.CHANGE_BRANDING_SETTINGS);
                  setModalOpen(true);
                }}
              />
            </Box>
          </Box>

          <Divider />
        </>
      )}

      {globalLoginMethod === GlobalLoginMethod.CREDENTIALS && (
        <>
          <Box sx={{ py: "1.5rem" }}>
            <Typography variant="h2" sx={{ pb: "0.75rem" }}>
              {translatedText(["securitySettingsTitle"])}
            </Typography>

            <Typography variant="body1">
              {translatedText(["securitySettingsDescription"])}
            </Typography>

            <Button
              label={translatedText(["resetPasswordButtonText"])}
              startIcon={IconName.LOCK_ICON}
              isFullWidth={false}
              styles={{ mt: "1.25rem", px: "1.75rem" }}
              buttonStyle={ButtonStyle.TERTIARY}
              onClick={() => {
                setModalType(SettingsModalTypes.RESET_PASSWORD);
                setModalOpen(true);
              }}
            />
          </Box>

          <Divider />
        </>
      )}

      {isEnterpriseMode && session?.user?.roles?.includes(ROLE_SUPER_ADMIN) && (
        <ManageSubscriptionSettingsSection />
      )}
    </>
  );
};

export default SettingsSection;
