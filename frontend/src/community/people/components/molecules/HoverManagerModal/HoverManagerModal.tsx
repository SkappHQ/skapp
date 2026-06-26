import { Typography } from "@mui/material";
import { common } from "@mui/material/colors";
import { type Theme, useTheme } from "@mui/material/styles";
import { Stack } from "@mui/system";

import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import { ManagerTypes } from "~community/common/types/CommonTypes";
import { AvatarPropTypes } from "~community/common/types/MoleculeTypes";

const HoverManagerModal = (supervisorDetails: AvatarPropTypes) => {
  const theme: Theme = useTheme();
  return (
    <Stack
      sx={{
        minWidth: "10.625rem"
      }}
    >
      <AvatarChip
        firstName={supervisorDetails?.firstName ?? ""}
        lastName={supervisorDetails?.lastName ?? ""}
        avatarUrl={supervisorDetails?.image ?? ""}
        styles={{
          backgroundColor: common.white,
          color: theme.palette.text.primary,
          [theme.breakpoints.down("xxl")]: {
            maxWidth: "8.125rem"
          },
          fontSize: "1rem",
          justifyContent: "left"
        }}
      />
      <Stack
        sx={{
          marginTop: ".5rem",
          alignItems: "center",
          textAlign: "center",
          color: theme.palette.text.primary,
          paddingY: ".5rem",
          paddingX: "1rem",
          backgroundColor: common.white,
          borderRadius: "3.125rem"
        }}
      >
        <Typography fontSize={".75rem"}>
          {supervisorDetails?.managerType === ManagerTypes.PRIMARY
            ? "Primary Supervisor"
            : supervisorDetails?.managerType === ManagerTypes.SECONDARY
              ? "Secondary Supervisor"
              : "Informant"}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default HoverManagerModal;
