import GroupsIcon from "@mui/icons-material/Groups";
import { Box } from "@mui/material";
import { JSX } from "react";

import { IconProps } from "~community/common/types/IconTypes";

const AnalyticsTeamIcon = ({
  fill,
  backgroundFill,
  width = "100%",
  height = "100%",
  id,
  onClick
}: IconProps): JSX.Element => {
  return (
    <Box
      id={id}
      sx={{
        width: width,
        height: height,
        color: fill,
        backgroundColor: backgroundFill
      }}
      onClick={onClick}
    >
      <GroupsIcon
        sx={{
          width: "100%",
          height: "100%"
        }}
      />
    </Box>
  );
};

export default AnalyticsTeamIcon;
