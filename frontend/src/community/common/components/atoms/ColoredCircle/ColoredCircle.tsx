import CheckIcon from "@mui/icons-material/Check";
import { Stack } from "@mui/material";
import { FC, MouseEventHandler } from "react";

import { mergeSx } from "~community/common/utils/commonUtil";

import { styles } from "./styles";

interface Props {
  color: string;
  onClick: MouseEventHandler<HTMLDivElement>;
  isSelected: boolean;
  dataTestId?: string;
}
const ColoredCircle: FC<Props> = ({
  color,
  onClick,
  isSelected,
  dataTestId
}) => {
  const classes = styles();

  return (
    <Stack
      sx={mergeSx([classes.container, { backgroundColor: `${color}` }])}
      onClick={onClick}
      component="div"
      data-testid={dataTestId}
    >
      {isSelected ? (
        <CheckIcon data-testid="checkIcon" color="secondary" fontSize="large" />
      ) : (
        <></>
      )}
    </Stack>
  );
};

export default ColoredCircle;
