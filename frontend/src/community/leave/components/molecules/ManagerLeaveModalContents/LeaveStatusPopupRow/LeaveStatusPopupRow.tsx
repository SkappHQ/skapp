import { Theme, useTheme } from "@mui/material";
import { CSSProperties, FC, JSX } from "react";

import ReadOnlyChip from "~community/common/components/atoms/Chips/BasicChip/ReadOnlyChip";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import { LeaveTypes } from "~community/leave/types/CustomLeaveAllocationTypes";
import {
  LeaveStatusTypes,
  leaveRequestRowDataTypes
} from "~community/leave/types/LeaveRequestTypes";
import { Manager } from "~community/people/types/EmployeeTypes";

interface Props {
  label: string;
  iconType?: "" | LeaveTypes | LeaveStatusTypes | string;
  durationByDays?: string;
  durationDate?: string;
  isRecipient?: boolean;
  styles?: CSSProperties;
  textStyles?: CSSProperties;
  role?: string | undefined;
  employee?:
    | { empName: ""; lastName: ""; avatarUrl: "" }
    | leaveRequestRowDataTypes;
  reviewer?: Manager;
  addLabel?: boolean;
  ariaLabel?: string;
  icon?: string | JSX.Element;
  profilePicture?: string;
}
const LeaveStatusPopupRow: FC<Props> = ({
  label,
  iconType,
  durationByDays,
  durationDate,
  isRecipient,
  styles = null,
  textStyles = null,
  role,
  employee,
  reviewer = null,
  addLabel = true,
  icon,
  profilePicture
}) => {
  const theme: Theme = useTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "14px",
        ...styles
      }}
      tabIndex={0}
    >
      {addLabel && (
        <p
          style={{
            whiteSpace: "nowrap",
            ...textStyles
          }}
        >
          {label} :
        </p>
      )}
      <div className="flex flex-row flex-wrap items-start gap-2">
        {iconType && (
          <IconChip
            accessibility={{
              ariaLabel: iconType
            }}
            label={iconType}
            icon={icon ?? iconType}
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
            firstName={reviewer?.name ?? ""}
            lastName={reviewer?.lastName ?? ""}
            avatarUrl={profilePicture ?? ""}
            chipStyles={{
              backgroundColor: theme.palette.grey[100],
              color: theme.palette.text.secondary
            }}
          />
        )}
        {isRecipient && role === "member" && (
          <AvatarChip
            firstName={employee?.empName ?? ""}
            lastName={employee?.lastName ?? ""}
            avatarUrl={employee?.avatarUrl}
            chipStyles={{
              backgroundColor: theme.palette.grey[100],
              color: theme.palette.text.secondary
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LeaveStatusPopupRow;
