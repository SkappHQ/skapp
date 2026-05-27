import { Badge, Box, Skeleton, Stack } from "@mui/material";
import { Breadcrumb, PageHeader } from "@rootcodelabs/skapp-ui";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import ClockWidget from "~community/attendance/components/molecules/ClockWidget/ClockWidget";
import { useAuth } from "~community/auth/providers/AuthProvider";
import { useGetUnreadNotificationsCount } from "~community/common/api/notificationsApi";
import { notificationsQueryKeys } from "~community/common/api/utils/QueryKeys";
import Icon from "~community/common/components/atoms/Icon/Icon";
import AppBarMenu from "~community/common/components/molecules/AppBarMenu/AppBarMenu";
import Avatar from "~community/common/components/molecules/Avatar/Avatar";
import { appBarTestId } from "~community/common/constants/testIds";
import useDrawer from "~community/common/hooks/useDrawer";
import {
  MediaQueries,
  useMediaQuery
} from "~community/common/hooks/useMediaQuery";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";
import { EmployeeTypes } from "~community/common/types/AuthTypes";
import { AppBarItemTypes } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { NotifyFilterButtonTypes } from "~community/common/types/notificationTypes";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

import styles from "./styles";

const AppBar = () => {
  const router = useRouter();
  const classes = styles();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTitle, setMenuTitle] = useState<AppBarItemTypes | null>(null);
  const [showClockWidget, setShowClockWidget] = useState(false);

  const queryMatches = useMediaQuery();
  const isBelow600 = queryMatches(MediaQueries.BELOW_600);
  const { handleDrawer } = useDrawer();
  const translateAria = useTranslator("commonAria", "components", "appBar");

  const { user } = useAuth();
  const userInfoRef = useRef<HTMLDivElement | null>(null);

  const { notifyData, setNotifyData, breadcrumbs } = useCommonStore(
    (state) => state
  );

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
        setNotifyData({
          notificationFilterType: NotifyFilterButtonTypes.UNREAD
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
      user?.roles?.includes(EmployeeTypes.ATTENDANCE_EMPLOYEE) || false
    );
  }, [user]);

  return (
    <>
      <PageHeader
        left={
          !isBelow600 ? (
            <Breadcrumb items={breadcrumbs} ariaLabel="Breadcrumb" />
          ) : null
        }
        right={
          <div className="flex w-full flex-row items-center justify-between gap-4">
            {employee ? (
              <Stack sx={classes.userInfoPanelWrapper} ref={userInfoRef}>
                {showClockWidget && <ClockWidget />}
                <div
                  className="cursor-pointer"
                  onClick={() => handleOpenMenu(AppBarItemTypes.NOTIFICATION)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleOpenMenu(AppBarItemTypes.NOTIFICATION);
                    }
                  }}
                  aria-label={translateAria(["notifications"])}
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
                    aria-atomic={true}
                  >
                    <Icon
                      name={IconName.BELL_ICON}
                      width="1.75rem"
                      height="1.75rem"
                    />
                  </Badge>
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    handleOpenMenu(AppBarItemTypes.ACCOUNT_DETAILS)
                  }
                  data-testid={appBarTestId.appBar.profileAvatar}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleOpenMenu(AppBarItemTypes.ACCOUNT_DETAILS);
                    }
                  }}
                  aria-label={translateAria(["accountDetails"])}
                >
                  <Avatar
                    firstName={employee?.firstName || ""}
                    lastName={employee?.lastName || ""}
                    src={
                      typeof employee?.authPic === "string"
                        ? employee.authPic
                        : ""
                    }
                    avatarStyles={{ width: "2.5rem", height: "2.5rem" }}
                  />
                </div>
              </Stack>
            ) : (
              <Skeleton
                variant="rounded"
                height="2.5rem"
                width="7.5rem"
                sx={classes.userInfoPanelWrapper}
                animation={"wave"}
              />
            )}

            {isBelow600 && (
              <button
                className="flex cursor-pointer items-center justify-center w-10 h-10"
                onClick={handleDrawer}
                aria-label={translateAria(["menuIcon"])}
              >
                <Icon
                  name={IconName.MENU_ICON}
                  width="1.5rem"
                  height="1.5rem"
                />
              </button>
            )}
          </div>
        }
      />
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
