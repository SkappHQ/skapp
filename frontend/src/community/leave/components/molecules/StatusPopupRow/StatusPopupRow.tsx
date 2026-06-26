import { Box, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { FC, JSX } from "react";

import ReadOnlyChip from "~community/common/components/atoms/Chips/BasicChip/ReadOnlyChip";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import { EmployeeLeaveRequestType } from "~community/leave/types/EmployeeLeaveRequestTypes";
import { useGetMyManagers } from "~community/people/api/PeopleApi";

interface Props {
  label: string;
  iconName?: string;
  durationByDays?: string;
  durationDate?: string;
  isRecipient?: boolean;
  styles?: Record<string, string>;
  textStyles?: Record<string, string>;
  reviewer?: EmployeeLeaveRequestType;
  addLabel?: boolean;
  icon?: string | JSX.Element;
}

const StatusPopupRow: FC<Props> = ({
  label,
  iconName,
  durationByDays,
  durationDate,
  isRecipient,
  styles = null,
  textStyles = null,
  reviewer = null,
  addLabel = true,
  icon
}) => {
  const theme: Theme = useTheme();
  const { data: managers } = useGetMyManagers();

  return (
    <Box
      component="div"
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "14px",
        ...styles
      }}
      tabIndex={0}
    >
      {addLabel && (
        <Typography
          component="div"
          sx={{
            fontWeight: "400",
            fontSize: "16px",
            lineHeight: "16px",
            whiteSpace: "nowrap",
            ...textStyles
          }}
        >
          {label} :
        </Typography>
      )}
      <Stack
        spacing={1}
        direction="row"
        flexWrap="wrap"
        alignItems="flex-start"
      >
        {iconName && (
          <IconChip
            accessibility={{
              ariaLabel: iconName
            }}
            label={iconName}
            icon={icon}
            chipStyles={{
              backgroundColor: theme.palette.grey[100],
              color: theme.palette.text.secondary,
              py: "12px"
            }}
            isTruncated={false}
            tabIndex={-1}
          />
        )}
        {durationByDays && (
          <ReadOnlyChip
            label={durationByDays}
            chipStyles={{
              backgroundColor: theme.palette.grey[100],
              py: "12px"
            }}
          />
        )}
        {durationDate && (
          <ReadOnlyChip
            label={durationDate}
            chipStyles={{
              backgroundColor: theme.palette.grey[100],
              width: "auto",
              py: "12px",
              "& .MuiChip-label": {
                maxWidth: undefined
              }
            }}
          />
        )}

        {isRecipient && reviewer !== null && (
          <AvatarChip
            firstName={reviewer?.firstName}
            lastName={reviewer?.lastName}
            avatarUrl={reviewer?.authPic}
            chipStyles={{
              backgroundColor: theme.palette.grey[100],
              color: theme.palette.text.secondary
            }}
          />
        )}

        {isRecipient && reviewer === null && managers && (
          <Stack
            direction={"row"}
            gap={1}
            flexWrap="wrap"
            alignItems="flex-start"
          >
            {managers.length > 2
              ? managers.map((manager) => (
                  <AvatarChip
                    key={manager.employeeId}
                    firstName={manager.firstName}
                    lastName={manager.lastName}
                    avatarUrl={manager.authPic}
                    chipStyles={{
                      backgroundColor: theme.palette.grey[100],
                      color: theme.palette.text.secondary
                    }}
                  />
                ))
              : managers.map((manager) => (
                  <AvatarChip
                    key={manager.employeeId}
                    firstName={manager.firstName}
                    lastName={manager.lastName}
                    avatarUrl={manager.authPic}
                    chipStyles={{
                      backgroundColor: theme.palette.grey[100],
                      color: theme.palette.text.secondary
                    }}
                  />
                ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default StatusPopupRow;
