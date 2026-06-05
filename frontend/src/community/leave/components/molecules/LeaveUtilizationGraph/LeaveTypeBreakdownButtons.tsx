import { Stack } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { Box, type SxProps } from "@mui/system";
import { Chip } from "@rootcodelabs/skapp-ui";
import { JSX, MouseEvent, useCallback, useState } from "react";

import DropDownArrow from "~community/common/assets/Icons/DropdownArrow";
import IconButton from "~community/common/components/atoms/IconButton/IconButton";
import Popper from "~community/common/components/molecules/Popper/Popper";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { MenuTypes } from "~community/common/types/MoleculeTypes";
import { getTabIndex } from "~community/common/utils/keyboardUtils";
import { SelectedFiltersTypes } from "~community/leave/types/LeaveUtilizationTypes";

type Props = {
  toggle?: SelectedFiltersTypes;
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
  maxTypeToShow = 3,
  styles,
  isGraph = false
}: Props): JSX.Element => {
  const { isFreeTier } = useSessionData();

  const theme: Theme = useTheme();

  const translateText = useTranslator("commonComponents", "multiTeamSelector");

  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const maxLeaveTypeToShow = maxTypeToShow;

  const count = toggle
    ? Object.values(toggle).filter((value) => value).length
    : null;

  const colorIndicator = (color: string): JSX.Element => {
    return (
      <Box
        sx={{
          backgroundColor: color,
          height: "8px",
          width: "8px"
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
          <Chip
            key={filterType}
            disabled={isFreeTier}
            onClick={() => onClick(filterType)}
            isSelected={toggle[filterType]}
            size="sm"
            prefixIcon={
              isGraph ? colorIndicator(colors[filterType]) : undefined
            }
            className="m-1"
            label={filterType}
          />
        );
      });
    },
    [colors, onClick, theme.palette.grey, toggle, isGraph, isFreeTier]
  );

  const renderTypes = useCallback(() => {
    if (toggle) {
      return (
        <>
          <Box display={"flex"}>
            {renderButtons(
              Object.fromEntries(
                Object.entries(toggle).slice(0, maxLeaveTypeToShow)
              ),
              0
            )}

            {Object.keys(toggle).length > maxLeaveTypeToShow && (
              <>
                <IconButton
                  tabIndex={getTabIndex(isFreeTier)}
                  text={`+ ${count - maxLeaveTypeToShow} ${translateText(["selected"])}`}
                  icon={<DropDownArrow />}
                  buttonStyles={{
                    bgcolor:
                      count > maxLeaveTypeToShow
                        ? theme.palette.secondary.main
                        : theme.palette.common.white,
                    p: "2px 10px",
                    marginX: "2px",
                    border:
                      count > maxLeaveTypeToShow
                        ? `1px solid ${theme.palette.secondary.dark}`
                        : null,
                    "&:focus": {
                      border: `2px solid ${theme.palette.secondary.dark}`
                    }
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
                      borderRadius: "12px",
                      padding: "4px",
                      width: "fit-content",
                      maxWidth: "300px",
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
          </Box>
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
        borderRadius: "58px",
        width: "auto",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: theme.palette.grey[200],
        padding: "4px",
        ...styles
      }}
    >
      {renderTypes()}
    </Stack>
  );
};

export default LeaveTypeBreakdownButtons;
