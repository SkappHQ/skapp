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
import { FC } from "react";

import { useGetEmailServerConfig, useGetUserLanguage, useUpdateUserLanguage } from "~community/common/api/settingsApi";
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
import DropdownList from "../../molecules/DropdownList/DropdownList";
import NotificationSettings from "../../molecules/NotificationSettinngs/NotificationSettinngs";
import Icon from "../../atoms/Icon/Icon";

interface LanguagePreferenceSectionProps {
  userLanguage?: string;
  isLanguageLoading: boolean;
  updateLanguageMutationIsPending:boolean;
  onLanguageChange: (language: string) => void;
  translatedText: (keys: string[]) => string;
}

const LanguagePreferenceSection: FC<LanguagePreferenceSectionProps> = ({
  userLanguage,
  isLanguageLoading,
  updateLanguageMutationIsPending,
  onLanguageChange,
  translatedText
}) => {
  const languageOptions = [
    {
      label: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name={IconName.ENGLISH_FLAG_ICON} width="16" height="13" />
          <Typography variant="body2" sx={{ fontWeight: 400, fontSize: '14px', lineHeight: '100%', letterSpacing: 0 }}>
            English
          </Typography>
        </Box>
      ),
      value: "en"
    },
    {
      label: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon name={IconName.SWEDISH_FLAG_ICON} width="16" height="13" />
          <Typography variant="body2" sx={{ fontWeight: 400, fontSize: '14px', lineHeight: '100%', letterSpacing: 0 }}>
            Swedish (Svenska)
          </Typography>
        </Box>
      ),
      value: "sv"
    }
  ];

  return (
    <Box sx={{ py: "1.5rem" }}>
      <Typography variant="h2" sx={{ pb: "0.75rem" }}>
        {translatedText(["languagePreference"])}
      </Typography>
      <Typography variant="body1">
        {translatedText(["languagePreferenceDescription"])}
      </Typography>
      <Box sx={{ mt: "1.25rem", maxWidth: "20rem" }}>
        <DropdownList
          inputName="LanguageDropdown"
          placeholder={translatedText(["languagePreferencePlaceholder"])}
          value={userLanguage || ""}
          isDisabled={updateLanguageMutationIsPending || isLanguageLoading}
          onChange={(event) => {
            const target = event.target as HTMLInputElement;
            onLanguageChange(target.value);
          }}
          itemList={languageOptions}
          required={false}
        />
      </Box>
    </Box>
  );
};

const SettingsSection: FC = () => {
  const translatedText = useTranslator("settings");

  const theme: Theme = useTheme();

  const isLargeScreen: boolean = useMediaQuery(theme.breakpoints.down("lg"));

  const { data: session } = useSession();

  const { setModalType, setModalOpen } = useCommonStore((state) => state);

  const isEnterpriseMode = useGetEnvironment() === appModes.ENTERPRISE;

  const { data: config } = useGetEmailServerConfig(isEnterpriseMode);

  const { data: userLanguage, isLoading: isLanguageLoading } = useGetUserLanguage();

  const updateLanguageMutation = useUpdateUserLanguage(() => {
    // Language updated successfully
  });

  const handleLanguageChange = (selectedLanguage: string) => {
    // Prevent multiple concurrent API calls
    if (updateLanguageMutation.isPending) {
      return;
    }

    updateLanguageMutation.mutate({ lang: selectedLanguage });
  };

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

          <LanguagePreferenceSection
            userLanguage={userLanguage}
            isLanguageLoading={isLanguageLoading}
            updateLanguageMutationIsPending={updateLanguageMutation.isPending}
            onLanguageChange={handleLanguageChange}
            translatedText={translatedText}
          />

          <Divider />
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
