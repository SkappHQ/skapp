import { Stack } from "@mui/material";

import { Button } from "@rootcodelabs/skapp-ui";
import Icon from "~community/common/components/atoms/Icon/Icon";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import LeaveAllocation from "~community/leave/components/molecules/LeaveAllocation/LeaveAllocation";
import { MyRequestModalEnums } from "~community/leave/enums/MyRequestEnums";
import { useLeaveStore } from "~community/leave/store/store";

const LeaveTypeSelectionModal = () => {
  const translateText = useTranslator(
    "leaveModule",
    "myRequests",
    "leaveTypeSelectionModal"
  );

  const { setMyLeaveRequestModalType } = useLeaveStore();

  return (
    <Stack sx={{ gap: "1rem" }}>
      <LeaveAllocation />
      <Button variant={"tertiary"} onClick={() => setMyLeaveRequestModalType(MyRequestModalEnums.NONE)} icon={<Icon name={IconName.RIGHT_ARROW_ICON} />} iconPosition="end">{translateText(["cancelBtn"])}</Button>
    </Stack>
  );
};

export default LeaveTypeSelectionModal;
