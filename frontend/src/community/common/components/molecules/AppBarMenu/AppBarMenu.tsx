import { ClickAwayListener, Popper } from "@mui/base";
import { Box, Fade, Grow, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { JSX } from "react";

import { useGetNotifications } from "~community/common/api/notificationsApi";
import { useScreenSizeRange } from "~community/common/hooks/useScreenSizeRange";
import { useCommonStore } from "~community/common/stores/commonStore";
import {
  AppBarItemTypes,
  SortKeyTypes,
  SortOrderTypes
} from "~community/common/types/CommonTypes";

import NotificationsFilter from "../NotificationsFilter/NotificationsFilter";
import NotificationsPopup from "../NotificationsPopup/NotificationsPopup";
import ProfileMenu from "../ProfileMenu/ProfileMenu";

interface Props {
  anchorEl: HTMLElement | null;
  handleCloseMenu: any;
  menuTitle: AppBarItemTypes | null;
}

const AppBarMenu = ({
  anchorEl,
  handleCloseMenu,
  menuTitle
}: Props): JSX.Element => {
  const theme: Theme = useTheme();
  const { notifyData, setNotifyData } = useCommonStore((state) => state);

  const { data } = useGetNotifications(
    0,
    3,
    SortOrderTypes.DESC,
    SortKeyTypes.CREATED_DATE
  );

  const notifications = data?.results?.[0]?.items;

  const { isSmallPhoneScreen, isSmallDesktopScreen } = useScreenSizeRange();

  return (
    <Popper
      id="custom-menu"
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      transition
      disablePortal
      role="dialog"
      aria-modal={true}
      aria-label={menuTitle as string}
      tabIndex={0}
      placement="bottom-end"
    >
      {({ TransitionProps }) => (
        <ClickAwayListener onClickAway={handleCloseMenu}>
          <Fade {...TransitionProps} timeout={350}>
            <div>
              <Grow in={Boolean(anchorEl)}>
                <Box
                  sx={{
                    marginTop: "0.5rem",
                    backgroundColor: "common.white",
                    minWidth: isSmallPhoneScreen ? "20rem" : "33rem",
                    borderRadius: "0.75rem",
                    padding: "1.25rem",
                    border: `0.0625rem solid ${theme.palette.grey[200]}`,
                    boxShadow: `0rem 0.5rem 0.5rem ${theme.palette.text.textLighter}`,
                    maxHeight: isSmallDesktopScreen
                      ? "calc(100vh - 10rem)"
                      : "74vh",
                    position: "relative"
                  }}
                >
                  {menuTitle == AppBarItemTypes.ACCOUNT_DETAILS && (
                    <ProfileMenu handleCloseMenu={handleCloseMenu} />
                  )}
                  {menuTitle == AppBarItemTypes.NOTIFICATION && (
                    <>
                      <Box component="div">
                        <Typography
                          variant="h1"
                          sx={{
                            mb: "1rem"
                          }}
                        >
                          {menuTitle}
                        </Typography>
                        <NotificationsFilter
                          filterButton={notifyData.notificationFilterType}
                          setFilterButton={(value) =>
                            setNotifyData({
                              notificationFilterType: value.filterButton
                            })
                          }
                        />
                      </Box>
                      <NotificationsPopup
                        handleCloseMenu={handleCloseMenu}
                        filterButton={notifyData.notificationFilterType}
                        notifications={notifications}
                      />
                    </>
                  )}
                </Box>
              </Grow>
            </div>
          </Fade>
        </ClickAwayListener>
      )}
    </Popper>
  );
};

export default AppBarMenu;
