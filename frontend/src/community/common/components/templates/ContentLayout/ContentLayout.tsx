import {
  Divider,
  IconButton,
  Stack,
  Theme,
  Typography,
  useTheme
} from "@mui/material";
import { type SxProps } from "@mui/system";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { JSX, memo, useEffect, useMemo } from "react";

import { useGetOrganization } from "~community/common/api/OrganizationCreateApi";
import { useStorageAvailability } from "~community/common/api/StorageAvailabilityApi";
import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import VersionUpgradeBanner from "~community/common/components/molecules/VersionUpgradeBanner/VersionUpgradeBanner";
import { appModes } from "~community/common/constants/configs";
import ROUTES from "~community/common/constants/routes";
import { contentLayoutTestId } from "~community/common/constants/testIds";
import {
  ButtonSizes,
  ButtonStyle
} from "~community/common/enums/ComponentEnums";
import {
  MediaQueries,
  useMediaQuery
} from "~community/common/hooks/useMediaQuery";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useVersionUpgradeStore } from "~community/common/stores/versionUpgradeStore";
import { themeSelector } from "~community/common/theme/themeSelector";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { ThemeTypes } from "~community/common/types/AvailableThemeColors";
import { IconName } from "~community/common/types/IconTypes";
import { mergeSx } from "~community/common/utils/commonUtil";
import { EIGHTY_PERCENT } from "~community/common/utils/getConstants";
import QuickSetupContainer from "~enterprise/common/components/molecules/QuickSetupContainer/QuickSetupContainer";
import SubscriptionEndedModalController from "~enterprise/common/components/molecules/SubscriptionEndedModalController/SubscriptionEndedModalController";
import {
  SubscriptionModalTypeEnums,
  TenantStatusEnums
} from "~enterprise/common/enums/Common";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";
import { shouldUseDefaultTheme } from "~enterprise/common/utils/commonUtil";
import { useCheckUserLimit } from "~enterprise/people/api/CheckUserLimitApi";
import UserLimitBanner from "~enterprise/people/components/molecules/UserLimitBanner/UserLimitBanner";
import { useUserLimitStore } from "~enterprise/people/store/userLimitStore";

import styles from "./styles";

interface Props {
  pageHead: string;
  title: string;
  titleAddon?: JSX.Element | null;
  containerStyles?: SxProps;
  dividerStyles?: SxProps;
  children: JSX.Element;
  secondaryBtnText?: string;
  primaryButtonText?: string | boolean;
  primaryBtnIconName?: IconName;
  secondaryBtnIconName?: IconName;
  isBackButtonVisible?: boolean;
  isDividerVisible?: boolean;
  primaryButtonType?: ButtonStyle;
  onPrimaryButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
  subtitleNextToTitle?: string;
  onBackClick?: () => void;
  customRightContent?: JSX.Element;
  isTitleHidden?: boolean;
  isPrimaryBtnLoading?: boolean;
  backIcon?: IconName;
  isPrimaryBtnDisabled?: boolean;
  showBackButtonTooltip?: boolean;
  id?: {
    btnWrapper?: string;
    primaryBtn?: string;
    secondaryBtn?: string;
  };
  shouldBlink?: {
    primaryBtn?: boolean;
    secondaryBtn?: boolean;
  };
  customStyles?: {
    header?: SxProps<Theme>;
  };
  ariaDescribedBy?: {
    primaryButton?: string;
    secondaryButton?: string;
  };
  isCloseButton?: boolean;
}

const ContentLayout = ({
  pageHead,
  title,
  titleAddon,
  containerStyles,
  children,
  primaryButtonText,
  secondaryBtnText,
  primaryButtonType,
  primaryBtnIconName = IconName.ADD_ICON,
  secondaryBtnIconName = IconName.ADD_ICON,
  isBackButtonVisible = false,
  isDividerVisible = true,
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  subtitleNextToTitle,
  onBackClick,
  dividerStyles,
  customRightContent,
  isTitleHidden = false,
  isPrimaryBtnLoading = false,
  backIcon = IconName.LEFT_ARROW_ICON,
  isPrimaryBtnDisabled = false,
  id,
  shouldBlink,
  customStyles,
  ariaDescribedBy,
  showBackButtonTooltip = true,
  isCloseButton = false
}: Props): JSX.Element => {
  const theme: Theme = useTheme();
  const isEnterpriseMode = process.env.NEXT_PUBLIC_MODE === "enterprise";
  const isBelow600 = useMediaQuery()(MediaQueries.BELOW_600);

  const classes = styles(theme);

  const translateAria = useTranslator("commonAria", "components");

  const router = useRouter();

  const { data } = useSession();
  const { asPath } = useRouter();

  const { showInfoBanner, isDailyNotifyDisplayed } = useVersionUpgradeStore(
    (state) => state
  );

  const isSuperAdmin = data?.user?.roles?.includes(AdminTypes.SUPER_ADMIN);
  const tenantStatus = data?.user?.tenantStatus;

  const modalTypeMap = {
    [TenantStatusEnums.SUBSCRIPTION_CANCELED_USER_LIMIT_EXCEEDED]:
      SubscriptionModalTypeEnums.POST_SUBSCRIPTION_CANCELLATION_MODAL,
    [TenantStatusEnums.FREE_TRAIL_ENDED]:
      SubscriptionModalTypeEnums.POST_TRIAL_EXPIRATION_MODAL,
    [TenantStatusEnums.TRIAL_ENDED_USER_LIMIT_EXCEEDED]:
      SubscriptionModalTypeEnums.POST_TRIAL_EXPIRATION_MODAL_USER_LIMIT_SURPASS_MODAL,
    [TenantStatusEnums.ACTIVE]: null
  };

  const { setIsSubscriptionEndedModalOpen, setSubscriptionEndedModalType } =
    useCommonEnterpriseStore((state) => state);

  useEffect(() => {
    if (
      asPath === ROUTES.REMOVE_PEOPLE ||
      asPath === ROUTES.CHANGE_SUPERVISORS
    ) {
      setIsSubscriptionEndedModalOpen(false);
      return;
    }

    if (!tenantStatus) return;

    if (
      !isSuperAdmin &&
      [
        TenantStatusEnums.SUBSCRIPTION_CANCELED_USER_LIMIT_EXCEEDED,
        TenantStatusEnums.FREE_TRAIL_ENDED,
        TenantStatusEnums.TRIAL_ENDED_USER_LIMIT_EXCEEDED
      ].includes(tenantStatus)
    ) {
      signOut({
        redirect: true,
        callbackUrl: ROUTES.AUTH.SYSTEM_UPDATE
      });
      return;
    }

    const modalType = modalTypeMap[tenantStatus];
    if (modalType) {
      setSubscriptionEndedModalType(modalType);
      setIsSubscriptionEndedModalOpen(true);
    } else if (tenantStatus === TenantStatusEnums.ACTIVE) {
      setIsSubscriptionEndedModalOpen(false);
    }
  }, [data?.user?.tenantStatus]);

  const { data: organizationDetails } = useGetOrganization(!!data);

  const themeColor = shouldUseDefaultTheme(asPath)
    ? ThemeTypes.BLUE_THEME
    : organizationDetails?.results?.[0]?.themeColor || ThemeTypes.BLUE_THEME;

  const updatedTheme = themeSelector(themeColor);

  theme.palette = updatedTheme.palette;

  const {
    setShowUserLimitBanner,
    showUserLimitBanner,
    setIsUserLimitExceeded
  } = useUserLimitStore((state) => ({
    setShowUserLimitBanner: state.setShowUserLimitBanner,
    showUserLimitBanner: state.showUserLimitBanner,
    setIsUserLimitExceeded: state.setIsUserLimitExceeded
  }));

  const { data: storageAvailabilityData } = useStorageAvailability(!!data);

  const usedStoragePercentage = useMemo(() => {
    return 100 - storageAvailabilityData?.availableSpace;
  }, [storageAvailabilityData]);

  const { data: checkUserLimit, isSuccess: isCheckUserLimitSuccess } =
    useCheckUserLimit(isEnterpriseMode, !!data);

  useEffect(() => {
    if (isEnterpriseMode) {
      if (isCheckUserLimitSuccess && checkUserLimit) {
        setIsUserLimitExceeded(true);
        setShowUserLimitBanner(true);
      }
    }
  }, [
    isEnterpriseMode,
    isCheckUserLimitSuccess,
    checkUserLimit,
    setIsUserLimitExceeded,
    setShowUserLimitBanner
  ]);

  return (
    <>
      <Head>
        <title>{pageHead}</title>
      </Head>
      <Stack sx={mergeSx([classes.container, containerStyles])}>
        {showInfoBanner &&
          !isDailyNotifyDisplayed &&
          data?.user.roles?.includes(AdminTypes.SUPER_ADMIN) && (
            <VersionUpgradeBanner />
          )}
        {process.env.NEXT_PUBLIC_MODE === appModes.COMMUNITY &&
          data?.user.roles?.includes(AdminTypes.SUPER_ADMIN) &&
          usedStoragePercentage !== undefined &&
          usedStoragePercentage !== null &&
          usedStoragePercentage >= EIGHTY_PERCENT && (
            <VersionUpgradeBanner
              isStorageBanner
              usedSpace={usedStoragePercentage}
            />
          )}

        {showUserLimitBanner &&
          (data?.user.roles?.includes(AdminTypes.SUPER_ADMIN) ||
            data?.user.roles?.includes(AdminTypes.PEOPLE_ADMIN)) && (
            <UserLimitBanner />
          )}

        <Stack sx={mergeSx([classes.header, customStyles?.header ?? {}])}>
          <Stack sx={classes.leftContent}>
            {isBackButtonVisible && (
              <IconButton
                sx={classes.leftArrowIconBtn}
                onClick={
                  onBackClick ||
                  (() => {
                    router.back();
                  })
                }
                data-testid={contentLayoutTestId.buttons.backButton}
                aria-label={
                  isCloseButton
                    ? translateAria(["closeButton"])
                    : translateAria(["backButton"])
                }
                {...(showBackButtonTooltip && {
                  title: isCloseButton
                    ? translateAria(["closeButton"])
                    : translateAria(["backButton"])
                })}
                tabIndex={0}
              >
                <Icon name={backIcon} />
              </IconButton>
            )}
            {!isTitleHidden && (
              <header aria-label={translateAria(["pageHeader"])}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h1" component="h1" id="page-title">
                    {title}
                  </Typography>
                  {titleAddon && (
                    <div aria-live="polite" aria-atomic="true">
                      {titleAddon}
                    </div>
                  )}
                </Stack>
              </header>
            )}
            {subtitleNextToTitle && (
              <Typography
                variant="body2"
                component="h3"
                id="subtitle-next-to-title"
                sx={{
                  color: theme.palette.primary.dark
                }}
              >
                {subtitleNextToTitle}
              </Typography>
            )}
          </Stack>
          <Stack sx={classes.rightContent} id={id?.btnWrapper}>
            {secondaryBtnText && (
              <Button
                isFullWidth={isBelow600}
                buttonStyle={ButtonStyle.SECONDARY}
                size={ButtonSizes.MEDIUM}
                label={secondaryBtnText}
                endIcon={secondaryBtnIconName}
                onClick={onSecondaryButtonClick}
                dataTestId={contentLayoutTestId.buttons.secondaryButton}
                shouldBlink={shouldBlink?.secondaryBtn}
                id={id?.secondaryBtn}
                accessibility={{
                  ariaDescribedBy: ariaDescribedBy?.secondaryButton
                }}
              />
            )}
            {primaryButtonText && (
              <Button
                isFullWidth={isBelow600}
                buttonStyle={primaryButtonType ?? ButtonStyle.PRIMARY}
                label={primaryButtonText as string}
                size={ButtonSizes.MEDIUM}
                endIcon={primaryBtnIconName}
                isLoading={isPrimaryBtnLoading}
                onClick={onPrimaryButtonClick}
                data-testid={contentLayoutTestId.buttons.primaryButton}
                shouldBlink={shouldBlink?.primaryBtn}
                id={id?.primaryBtn}
                disabled={isPrimaryBtnDisabled}
                accessibility={{
                  ariaDescribedBy: ariaDescribedBy?.primaryButton
                }}
              />
            )}
            {customRightContent}
          </Stack>
        </Stack>

        {isDividerVisible && (
          <Stack sx={mergeSx([classes.dividerWrapper, dividerStyles])}>
            <Divider />
          </Stack>
        )}
        {children}
        <QuickSetupContainer />
        <SubscriptionEndedModalController />
      </Stack>
    </>
  );
};

export default memo(ContentLayout);
