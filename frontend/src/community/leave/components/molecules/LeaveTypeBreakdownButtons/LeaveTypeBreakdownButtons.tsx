import { Box, Stack, SxProps } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { JSX, MouseEvent, useCallback, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import IconButton from "~community/common/components/atoms/IconButton/IconButton";
import Popper from "~community/common/components/molecules/Popper/Popper";
import {
  MediaQueries,
  useMediaQuery
} from "~community/common/hooks/useMediaQuery";
import { useCommonStore } from "~community/common/stores/commonStore";
import { IconName } from "~community/common/types/IconTypes";
import { MenuTypes } from "~community/common/types/MoleculeTypes";
import { SelectedFiltersTypes } from "~community/leave/types/TeamLeaveAnalyticsTypes";

const buttonStyles = {
  borderRadius: "4rem",
  padding: "0.25rem 0.5rem",
  width: "fit-content",
  fontSize: "0.75rem",
  margin: "0.125rem"
};

type Props = {
  toggle: SelectedFiltersTypes;
  onClick: (i: string) => void;
  colors?: Record<string, string>;
  maxTypeToShow?: number;
  styles?: SxProps;
  isGraph?: boolean;
};

const LeaveTypeBreakdownButtons = ({
  onClick,
  toggle,
  colors,
  maxTypeToShow = 5,
  styles,
  isGraph = false
}: Props): JSX.Element => {
  const theme: Theme = useTheme();
  const { isDrawerToggled } = useCommonStore((state) => ({
    isDrawerToggled: state.isDrawerExpanded
  }));
  const isTabScreen = useMediaQuery()(MediaQueries.BELOW_1024);
  const isMiniTabScreen = useMediaQuery()(MediaQueries.BELOW_900);
  const maxLeaveTypeToShow = isMiniTabScreen
    ? 0
    : isDrawerToggled && isTabScreen
      ? 0
      : maxTypeToShow;
  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const count = toggle
    ? Object.values(toggle).filter((value) => value).length
    : null;

  const colorIndicator = (color: string): JSX.Element => {
    return (
      <Box
        sx={{
          backgroundColor: color,
          height: "0.5rem",
          width: "0.5rem"
        }}
      ></Box>
    );
  };

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const renderButtons = useCallback(
    (filterTypesArray: SelectedFiltersTypes) => {
      return Object.keys(filterTypesArray).map((filterType) => {
        return (
          <ButtonV2
            key={filterType}
            fullWidth={false}
            onClick={() => onClick(filterType)}
            variant={toggle[filterType] ? "secondary" : "tertiary"}
            size={"md"}
            icon={
              !isGraph
                ? undefined
                : (colorIndicator(colors[filterType]) ?? undefined)
            }
            iconPosition="start"
          >
            {filterType}
          </ButtonV2>
        );
      });
    },
    [colors, onClick, theme.palette.grey, toggle, isGraph]
  );

  const renderTypes = useCallback(() => {
    if (toggle) {
      return (
        <>
          <Stack direction="row">
            {renderButtons(
              Object.fromEntries(
                Object.entries(toggle).slice(0, maxLeaveTypeToShow)
              ),
              0
            )}
            {Object.keys(toggle).length > maxLeaveTypeToShow && (
              <>
                <IconButton
                  text={"+" + String(count - maxLeaveTypeToShow) + " selected"}
                  icon={<Icon name={IconName.DROPDOWN_ARROW_ICON} />}
                  buttonStyles={{
                    bgcolor:
                      count > maxLeaveTypeToShow
                        ? theme.palette.secondary.main
                        : theme.palette.common.white,
                    p: "0.125rem 0.375rem",
                    pl: "0.5rem",
                    marginX: "2px",
                    border:
                      count > maxLeaveTypeToShow
                        ? `1px solid ${theme.palette.secondary.dark}`
                        : null
                  }}
                  isTextPermenent={count > maxLeaveTypeToShow}
                  onClick={(e: MouseEvent<HTMLElement>) => handleClick(e)}
                />

                <Popper
                  anchorEl={anchorEl}
                  open={open}
                  position={"bottom-end"}
                  id={"show more types"}
                  menuType={MenuTypes.GRAPH}
                  timeout={300}
                  handleClose={() => {
                    setOpen((previousOpen) => !previousOpen);
                  }}
                >
                  <Box
                    sx={{
                      borderRadius: "0.75rem",
                      padding: "0.25rem",
                      width: "18.75rem",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.25rem",
                      backgroundColor: theme.palette.grey[200],
                      height: "fit-content"
                    }}
                  >
                    {renderButtons(
                      Object.fromEntries(
                        Object.entries(toggle).slice(maxLeaveTypeToShow)
                      ),
                      maxLeaveTypeToShow
                    )}
                  </Box>
                </Popper>
              </>
            )}
          </Stack>
        </>
      );
    }
  }, [
    toggle,
    renderButtons,
    maxLeaveTypeToShow,
    count,
    theme.palette.secondary.main,
    theme.palette.secondary.dark,
    theme.palette.common.white,
    theme.palette.grey,
    anchorEl,
    open
  ]);

  return (
    <Stack
      direction={"row"}
      sx={{
        borderRadius: "3.625rem",
        width: "auto",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: theme.palette.grey[200],
        padding: "0.25rem",
        ...styles
      }}
    >
      {renderTypes()}
    </Stack>
  );
};

export default LeaveTypeBreakdownButtons;
