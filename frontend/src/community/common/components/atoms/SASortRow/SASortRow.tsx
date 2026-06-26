import {
  MenuItem,
  Stack,
  type SxProps,
  Typography,
  styled,
  useTheme
} from "@mui/material";
import { JSX, type MouseEventHandler } from "react";

import { IconName } from "~community/common/types/IconTypes";

import Icon from "../Icon/Icon";

interface Props {
  id?: string;
  text: string;
  selected: boolean;
  onClick: MouseEventHandler<HTMLLIElement>;
  isStartIcon?: boolean;
  textStyles?: SxProps;
  ariaLabel?: string;
  isDisabled?: boolean;
  isSoftDisabled?: boolean;
  startIcon?: IconName;
  showSelectedIcon?: boolean;
}

const SortRow = ({
  id,
  text,
  selected,
  onClick,
  isStartIcon = false,
  textStyles,
  ariaLabel,
  isDisabled = false,
  isSoftDisabled = false,
  startIcon = IconName.REMOVE_CIRCLE_ICON,
  showSelectedIcon = true
}: Props): JSX.Element => {
  const theme = useTheme();
  const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingTop: "12px",
    paddingBottom: "12px",
    justifyContent: "space-between",
    borderRadius: "12px",

    "&.Mui-selected": {
      backgroundColor: theme.palette.secondary.main,
      border: "1px solid",
      borderColor: theme.palette.grey[300],
      color: theme.palette.primary.dark
    },
    "&.Mui-disabled": {
      backgroundColor: theme.palette.grey[100],
      color: theme.palette.grey.A100
    },
    ...(isSoftDisabled && {
      backgroundColor: theme.palette.grey[100],
      color: theme.palette.grey.A100,
      ":hover": {
        backgroundColor: "none"
      }
    })
  }));
  return (
    <StyledMenuItem
      id={id ?? "sort-row-id"}
      disableRipple
      selected={selected}
      onClick={onClick}
      tabIndex={0}
      aria-selected={selected}
      aria-label={ariaLabel}
      disabled={isDisabled}
      data-value={text}
    >
      <Stack direction="row" alignItems="center" gap="8px">
        {isStartIcon && (
          <Icon
            name={startIcon}
            fill={
              selected ? theme.palette.primary.dark : theme.palette.common.black
            }
          />
        )}
        <Typography variant="body2" sx={{ ...textStyles }}>
          {text}
        </Typography>
      </Stack>
      {selected && showSelectedIcon && (
        <Icon name={IconName.CHECK_CIRCLE_ICON} />
      )}
    </StyledMenuItem>
  );
};

export default SortRow;
