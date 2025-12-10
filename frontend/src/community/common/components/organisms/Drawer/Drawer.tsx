import {
  Box,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Link as MuiLink,
  Stack,
  Theme,
  useTheme
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { CSSProperties, JSX, useEffect, useMemo, useState } from "react";

import { useGetUploadedImage } from "~community/common/api/FileHandleApi";
import { useGetOrganization } from "~community/common/api/OrganizationCreateApi";
import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { appModes } from "~community/common/constants/configs";
import ROUTES from "~community/common/constants/routes";
import { appDrawerTestId } from "~community/common/constants/testIds";
import { FileTypes } from "~community/common/enums/CommonEnums";
import {
  ButtonSizes,
  ButtonStyle
} from "~community/common/enums/ComponentEnums";
import useDrawer from "~community/common/hooks/useDrawer";
import {
  MediaQueries,
  useMediaQuery
} from "~community/common/hooks/useMediaQuery";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";
import { themeSelector } from "~community/common/theme/themeSelector";
import { EmployeeTypes } from "~community/common/types/AuthTypes";
import { ThemeTypes } from "~community/common/types/AvailableThemeColors";
import { IconName } from "~community/common/types/IconTypes";
import { CommonStoreTypes } from "~community/common/types/zustand/StoreTypes";
import getDrawerRoutes from "~community/common/utils/getDrawerRoutes";
import { shouldActivateLink } from "~community/common/utils/keyboardUtils";
import { MyRequestModalEnums } from "~community/leave/enums/MyRequestEnums";
import { useLeaveStore } from "~community/leave/store/store";
import { useGetOrganizationCalendarStatus } from "~enterprise/common/api/CalendarApi";
import Badge from "~enterprise/common/components/atoms/Badge/Badge";
import SubmitRequestModalController from "~enterprise/common/components/organisms/SubmitRequestModalController/SubmitRequestModalController";
import { SubmitRequestModalEnums } from "~enterprise/common/enums/Common";
import { useGetEnvironment } from "~enterprise/common/hooks/useGetEnvironment";
import useS3Download from "~enterprise/common/hooks/useS3Download";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

import FullScreenLoader from "../../molecules/FullScreenLoader/FullScreenLoader";
import { StyledDrawer } from "./StyledDrawer";
import { getSelectedDrawerItemColor, styles } from "./styles";

const Drawer = (): JSX.Element => {
  const theme: Theme = useTheme();
  const classes = styles({ theme });

  const translateText = useTranslator("commonComponents", "drawer");
  const translateAria = useTranslator("commonAria", "components", "drawer");

  const router = useRouter();

  const { data: sessionData } = useSession();

  const queryMatches = useMediaQuery();
  const isBelow1024 = queryMatches(MediaQueries.BELOW_1024);

  const environment = useGetEnvironment();

  const { s3FileUrls, downloadS3File } = useS3Download();

  const { handleDrawer } = useDrawer(isBelow1024);

  const { data: organizationDetails, isLoading: orgLoading } =
    useGetOrganization();

  const organizationLogo = organizationDetails?.results[0]?.organizationLogo;
  const organizationName = organizationDetails?.results[0]?.organizationName;

  const { data: logoUrl, isLoading } = useGetUploadedImage(
    FileTypes.ORGANIZATION_LOGOS,
    organizationLogo,
    false
  );

  const {
    isDrawerExpanded,
    expandedDrawerListItem,
    setExpandedDrawerListItem,
    setOrgData
  } = useCommonStore((state: CommonStoreTypes | any) => ({
    isDrawerExpanded: state.isDrawerExpanded,
    expandedDrawerListItem: state.expandedDrawerListItem,
    setExpandedDrawerListItem: state.setExpandedDrawerListItem,
    setOrgData: state.setOrgData
  }));

  const { globalLoginMethod } = useCommonEnterpriseStore((state) => ({
    globalLoginMethod: state.globalLoginMethod
  }));

  const { data: organizationCalendarStatusData } =
    useGetOrganizationCalendarStatus();

  const { setMyLeaveRequestModalType } = useLeaveStore((state) => ({
    setMyLeaveRequestModalType: state.setMyLeaveRequestModalType
  }));

  const [orgLogo, setOrgLogo] = useState<string | null>(null);

  const isEnterprise = environment === appModes.ENTERPRISE;

  const drawerRoutes = useMemo(
    () =>
      getDrawerRoutes({
        userRoles: sessionData?.user?.roles,
        tier: sessionData?.user?.tier ?? "",
        isEnterprise,
        globalLoginMethod,
        tenantID: sessionData?.user?.tenantId,
        organizationCalendarGoogleStatus:
          organizationCalendarStatusData?.isGoogleCalendarEnabled ?? false,
        organizationCalendarMicrosoftStatus:
          organizationCalendarStatusData?.isMicrosoftCalendarEnabled ?? false
      }),
    [
      sessionData,
      isEnterprise,
      globalLoginMethod,
      organizationCalendarStatusData
    ]
  );

  const updatedTheme = themeSelector(
    organizationDetails?.results?.[0]?.themeColor || ThemeTypes.BLUE_THEME
  );

  theme.palette = updatedTheme.palette;

  useEffect(() => {
    if (environment === appModes.COMMUNITY) {
      if (logoUrl) setOrgLogo(logoUrl);
    } else if (environment === appModes.ENTERPRISE) {
      setOrgLogo(s3FileUrls[organizationLogo]);
    }
  }, [logoUrl, organizationLogo, s3FileUrls, environment]);

  useEffect(() => {
    if (organizationLogo || !s3FileUrls[organizationLogo]) {
      downloadS3File({ filePath: organizationLogo });
    }
  }, [organizationLogo]);

  const handleListItemButtonClick = (
    id: string,
    hasSubTree: boolean,
    url: string | null
  ) => {
    if (!hasSubTree) {
      document.body.setAttribute("tabindex", "-1");
      document.body.focus();
      router.push(url ?? "");
      isBelow1024 && handleDrawer();
    } else {
      setExpandedDrawerListItem(expandedDrawerListItem === id ? "" : id);
    }
  };

  useEffect(() => {
    if (organizationDetails?.results[0] && !orgLoading) {
      setOrgData(organizationDetails?.results[0]);
    }
  }, [organizationDetails, orgLoading]);

  const { setSubmitRequestModalType } = useCommonEnterpriseStore();

  const handleOpenSubmitRequestModal = () => {
    setSubmitRequestModalType(SubmitRequestModalEnums.SUBMIT_REQUEST);
  };

  if (orgLoading) return <FullScreenLoader />;

  return (
    <StyledDrawer
      variant="permanent"
      anchor="left"
      open={isDrawerExpanded}
      onClose={handleDrawer}
      hideBackdrop={false}
      component="nav"
      aria-label={translateAria(["drawer"])}
    >
      <Stack
        sx={{
          ...classes.drawerContainer(isDrawerExpanded),
          visibility: "visible"
        }}
        id="side-bar"
        role="document"
      >
        <Box sx={classes.imageWrapper}>
          {!isLoading && (
            <img
              src={orgLogo || "/logo/logo.png"}
              alt={organizationName ?? "Organization Logo"}
              width={logoUrl ? 0 : 208}
              height={logoUrl ? 0 : 77}
              style={classes.logoImage}
              data-testid={appDrawerTestId.organizationLogo}
              onClick={() => router.push(ROUTES.DASHBOARD.BASE)}
              onKeyDown={(e) => {
                if (shouldActivateLink(e.key)) {
                  e.preventDefault();
                  router.push(ROUTES.DASHBOARD.BASE);
                }
              }}
              tabIndex={0}
              role="button"
            />
          )}
        </Box>
        <List sx={classes.list} role="list">
          {drawerRoutes ? (
            drawerRoutes.map((route) => {
              const isExpanded = route?.id === expandedDrawerListItem;
              const hasSubTree = route?.hasSubTree ?? false;
              const routeId = route?.id ?? "";
              const isActiveRoute =
                !hasSubTree && router.pathname.includes(route?.url ?? "");

              return (
                <ListItem
                  disablePadding
                  key={routeId}
                  role="listitem"
                  sx={classes.listItem}
                  data-testid={appDrawerTestId.mainRoutes + routeId}
                >
                  <ListItemButton
                    disableRipple
                    sx={classes.listItemButton(isActiveRoute)}
                    onClick={() =>
                      handleListItemButtonClick(
                        routeId,
                        hasSubTree,
                        route?.url ?? null
                      )
                    }
                    onKeyDown={(e) => {
                      if (shouldActivateLink(e.key)) {
                        e.preventDefault();
                        handleListItemButtonClick(
                          routeId,
                          hasSubTree,
                          route?.url ?? null
                        );
                      }
                    }}
                    aria-expanded={isExpanded}
                    aria-controls={`sub-list-${routeId}`}
                  >
                    <ListItemIcon sx={classes.listItemIcon}>
                      {route?.icon && (
                        <Icon
                          name={route.icon}
                          fill={getSelectedDrawerItemColor(
                            theme,
                            router.pathname,
                            route.url
                          )}
                        />
                      )}
                    </ListItemIcon>
                    <Box sx={classes.listItemContent}>
                      <ListItemText
                        primary={route?.name}
                        sx={classes.listItemText(
                          getSelectedDrawerItemColor(
                            theme,
                            router.pathname,
                            route?.url ?? null
                          )
                        )}
                      />
                      {route?.badge && <Badge text={route.badge} />}
                      <ListItemIcon
                        sx={classes.chevronIcons(
                          expandedDrawerListItem,
                          routeId,
                          hasSubTree
                        )}
                      >
                        <Icon
                          name={IconName.DROPDOWN_ARROW_ICON}
                          width="0.625rem"
                          height="0.3125rem"
                          fill={getSelectedDrawerItemColor(
                            theme,
                            router.pathname,
                            route?.url ?? ""
                          )}
                          svgProps={{
                            style: {
                              fill: getSelectedDrawerItemColor(
                                theme,
                                router.pathname,
                                route?.url ?? ""
                              )
                            }
                          }}
                        />
                      </ListItemIcon>
                    </Box>
                  </ListItemButton>

                  {hasSubTree && (
                    <Collapse
                      in={isExpanded}
                      collapsedSize="0rem"
                      sx={classes.collapse}
                    >
                      <List
                        sx={classes.subList}
                        id={`sub-list-${routeId}`}
                        role="list"
                      >
                        {route?.subTree?.map((subTreeRoute) => (
                          <ListItem
                            key={subTreeRoute.id}
                            role="listitem"
                            sx={classes.subListItem}
                            onClick={() =>
                              handleListItemButtonClick(
                                subTreeRoute.id,
                                subTreeRoute.hasSubTree,
                                subTreeRoute.url
                              )
                            }
                            onKeyDown={(e) => {
                              if (shouldActivateLink(e.key)) {
                                e.preventDefault();
                                handleListItemButtonClick(
                                  subTreeRoute.id,
                                  subTreeRoute.hasSubTree,
                                  subTreeRoute.url
                                );
                              }
                            }}
                            data-testid={
                              appDrawerTestId.subRoutes + subTreeRoute.id
                            }
                          >
                            <ListItemButton
                              disableRipple
                              sx={classes.subListItemButton(
                                router.pathname.includes(
                                  subTreeRoute?.url ?? ""
                                )
                              )}
                              tabIndex={isExpanded ? 0 : -1}
                            >
                              <ListItemText
                                primary={subTreeRoute.name}
                                sx={classes.subListItemText(
                                  getSelectedDrawerItemColor(
                                    theme,
                                    router.pathname,
                                    subTreeRoute.url
                                  )
                                )}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  )}
                </ListItem>
              );
            })
          ) : (
            <></>
          )}
        </List>

        {isDrawerExpanded && (
          <Stack sx={classes.footer}>
            {sessionData?.user.roles?.includes(
              EmployeeTypes.LEAVE_EMPLOYEE
            ) && (
              <Button
                styles={classes.applyLeaveBtn}
                size={ButtonSizes.MEDIUM}
                isFullWidth={false}
                label={translateText(["applyLeaveBtn"])}
                buttonStyle={ButtonStyle.PRIMARY}
                endIcon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
                onClick={() =>
                  setMyLeaveRequestModalType(
                    MyRequestModalEnums.LEAVE_TYPE_SELECTION
                  )
                }
                data-testid={appDrawerTestId.buttons.applyLeaveBtn}
              />
            )}
            <MuiLink
              onClick={handleOpenSubmitRequestModal}
              variant="body1"
              color="inherit"
              underline="hover"
              sx={{ ...classes.link, cursor: "pointer" }}
              data-testid={appDrawerTestId.getHelpLink}
            >
              {translateText(["getHelp"])}
            </MuiLink>
            <SubmitRequestModalController />
          </Stack>
        )}
      </Stack>
      <IconButton
        sx={{ ...classes.iconBtn(isDrawerExpanded), visibility: "visible" }} // TO DO: Need to verify why this style affects other places which use this icon
        onClick={handleDrawer}
        data-testid={appDrawerTestId.buttons.drawerToggleBtn}
        aria-label={
          isDrawerExpanded
            ? translateAria(["collapse"])
            : translateAria(["expand"])
        }
      >
        <Box sx={classes.iconToggleBox}>
          {[IconName.DRAWER_CLOSE_ICON, IconName.DRAWER_OPEN_ICON].map(
            (icon, index) => {
              const isVisible = isDrawerExpanded === (index === 0);
              return (
                <Icon
                  key={icon}
                  name={icon}
                  fill={theme.palette.common.black}
                  svgProps={{
                    style: classes.iconToggle(isVisible) as CSSProperties
                  }}
                />
              );
            }
          )}
        </Box>
      </IconButton>
    </StyledDrawer>
  );
};

export default Drawer;
