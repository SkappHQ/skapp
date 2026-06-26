import {
  MenuItem as MuiMenuItem,
  Stack,
  type SxProps,
  Typography,
  styled
} from "@mui/material";
import { JSX, type MouseEventHandler } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

interface Props {
  id?: string;
  text: string;
  selected: boolean;
  onClick: MouseEventHandler<HTMLLIElement>;
  textStyles?: SxProps;
  ariaLabel?: string;
  isDisabled?: boolean;
  isSoftDisabled?: boolean;
}

const MenuItem = ({
  id,
  text,
  selected,
  onClick,
  textStyles,
  ariaLabel,
  isDisabled = false,
  isSoftDisabled = false
}: Props): JSX.Element => {
  const StyledMenuItem = styled(MuiMenuItem)(({ theme }) => ({
    paddingLeft: "1rem",
    paddingRight: "1rem",
    paddingTop: "0.75rem",
    paddingBottom: "0.75rem",
    justifyContent: "space-between",
    borderRadius: "0.75rem",

    "&.Mui-selected": {
      backgroundColor: theme.palette.secondary.main,
      border: "0.0625rem solid",
      borderColor: theme.palette.grey[300],
      color: theme.palette.primary.dark,

      svg: {
        fill: theme.palette.primary.dark,

        path: {
          fill: theme.palette.primary.dark
        }
      }
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
      aria-label={ariaLabel}
      disabled={isDisabled}
      data-value={text}
      data-testid={id}
    >
      <Stack direction="row" alignItems="center" gap="0.5rem">
        <Typography variant="body2" sx={{ ...textStyles }}>
          {text}
        </Typography>
      </Stack>
      {selected && <Icon name={IconName.CHECK_CIRCLE_ICON} />}
    </StyledMenuItem>
  );
};

export default MenuItem;
