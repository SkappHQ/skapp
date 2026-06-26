import { Stack } from "@mui/material";

import SwitchRow from "~community/common/components/atoms/SwitchRow/SwitchRow";
import Tooltip from "~community/common/components/atoms/Tooltip/Tooltip";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useLeaveStore } from "~community/leave/store/store";

import styles from "./styles";

const LeaveTypeActivationToggleButton = () => {
  const classes = styles();

  const translateText = useTranslator("leaveModule", "leaveTypes");

  const { editingLeaveType, setEditingLeaveType } = useLeaveStore(
    (state) => state
  );

  return (
    <Stack sx={classes.wrapper}>
      <SwitchRow
        labelId="activate"
        label={translateText(["activate"])}
        checked={editingLeaveType?.isActive ?? true}
        onChange={() => {
          setEditingLeaveType({
            ...editingLeaveType,
            isActive: !editingLeaveType.isActive
          });
        }}
      />
      <Tooltip
        id="activate-leave-tooltip"
        title={`${translateText(["activateLeaveTooltipText"])}`}
      />
    </Stack>
  );
};

export default LeaveTypeActivationToggleButton;
