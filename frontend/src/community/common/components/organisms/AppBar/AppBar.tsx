import {
  Badge,
  Box,
  IconButton,
  Skeleton,
  Stack,
  Typography
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import ClockWidget from "~community/attendance/components/molecules/ClockWidget/ClockWidget";
import { useGetUnreadNotificationsCount } from "~community/common/api/notificationsApi";
import { notificationsQueryKeys } from "~community/common/api/utils/QueryKeys";
import Icon from "~community/common/components/atoms/Icon/Icon";
import AppBarMenu from "~community/common/components/molecules/AppBarMenu/AppBarMenu";
import Avatar from "~community/common/components/molecules/Avatar/Avatar";
import { appBarTestId } from "~community/common/constants/testIds";
import useDrawer from "~community/common/hooks/useDrawer";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";
import { EmployeeTypes } from "~community/common/types/AuthTypes";
import { AppBarItemTypes } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

import styles from "./styles";

const AppBar = () => {
  const translateAria = useTranslator("commonAria", "components", "appBar");

  const classes = styles();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTitle, setMenuTitle] = useState<AppBarItemTypes | null>(null);
  const [showClockWidget, setShowClockWidget] = useState(false);

  const { handleDrawer } = useDrawer();

  const { data: session, status } = useSession();

  const userInfoRef = useRef<HTMLDivElement | null>(null);
  const { notifyData, setNotifyData } = useCommonStore((state) => state);
  const { data: employee } = useGetUserPersonalDetails();

  const handleCloseMenu = (): void => {
    setAnchorEl(null);
    setMenuTitle(null);
  };

  const queryClient = useQueryClient();

  const handleOpenMenu = (title: AppBarItemTypes): void => {
    if (menuTitle === title) {
      handleCloseMenu();
    } else {
      if (title === AppBarItemTypes.NOTIFICATION) {
        queryClient.invalidateQueries({
          queryKey: [notificationsQueryKeys.GET_NOTIFICATIONS]
        });
      }
      setAnchorEl(userInfoRef.current);
      setMenuTitle(title);
    }
  };

  const { data: unreadCount } = useGetUnreadNotificationsCount();

  useEffect(() => {
    setNotifyData({
      unreadCount: unreadCount || 0
    });
  }, [setNotifyData, unreadCount]);

  useEffect(() => {
    setShowClockWidget(
      session?.user?.roles?.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE) || false
    );
  }, [session]);

  return (
    <>
      <Stack
        sx={classes.wrapper}
        id="top-bar"
        tabIndex={0}
        component="header"
        aria-label={translateAria(["appBar"])}
      >
        <Stack
          sx={{
            ...classes.container,
            justifyContent: showClockWidget ? "space-between" : "flex-end"
          }}
        >
          {showClockWidget && <ClockWidget />}
          {employee ? (
            <Stack sx={classes.userInfoPanelWrapper} ref={userInfoRef}>
              <Box
                sx={{ cursor: "pointer", mr: "0.25rem" }}
                onClick={() => handleOpenMenu(AppBarItemTypes.NOTIFICATION)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleOpenMenu(AppBarItemTypes.NOTIFICATION);
                  }
                }}
                aria-label="Notifications"
              >
                <Badge
                  sx={{
                    ".MuiBadge-badge": {
                      backgroundColor: "error.contrastText",
                      color: "common.white"
                    }
                  }}
                  badgeContent={notifyData.unreadCount}
                  invisible={false}
                  max={100}
                  aria-atomic={true}
                >
                  <Icon name={IconName.BELL_ICON} width="2rem" height="2rem" />
                </Badge>
              </Box>
              <Box
                sx={{ cursor: "pointer" }}
                onClick={() => handleOpenMenu(AppBarItemTypes.ACCOUNT_DETAILS)}
                data-testid={appBarTestId.appBar.profileAvatar}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleOpenMenu(AppBarItemTypes.ACCOUNT_DETAILS);
                  }
                }}
                aria-label="Account details"
              >
                <Avatar
                  firstName={employee?.firstName || ""}
                  lastName={employee?.lastName || ""}
                  src={
                    typeof employee?.authPic === "string"
                      ? employee.authPic
                      : ""
                  }
                />
              </Box>
              <Stack sx={classes.userInfo}>
                <Typography sx={classes.name}>
                  {status !== "loading" &&
                    `${employee?.firstName} ${employee?.lastName}`}
                </Typography>
                <Typography sx={classes.userRole}>
                  {employee?.jobTitle?.name}
                </Typography>
              </Stack>
            </Stack>
          ) : (
            <Skeleton
              variant="rounded"
              height="4.5rem"
              width="7.5rem"
              sx={classes.userInfoPanelWrapper}
              animation={"wave"}
            />
          )}
        </Stack>
        <IconButton
          onClick={handleDrawer}
          sx={classes.menuIconBtn}
          aria-label={translateAria(["menuIcon"])}
        >
          <Icon name={IconName.MENU_ICON} />
        </IconButton>
      </Stack>
      <Box sx={classes.appBarMenuWrapper}>
        <AppBarMenu
          anchorEl={anchorEl}
          handleCloseMenu={handleCloseMenu}
          menuTitle={menuTitle}
        />
      </Box>
    </>
  );
};

export default AppBar;
