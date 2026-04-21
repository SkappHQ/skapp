import { Box, Typography } from "@mui/material";
import { Theme, useTheme } from "@mui/material/styles";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";

import SyncIcon from "~community/common/assets/Icons/SyncIcon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import LeaveCarryForwardModalController from "~community/leave/components/organisms/LeaveCarryForwardModalController/LeaveCarryForwardModalController";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveCarryForwardModalTypes } from "~community/leave/types/LeaveCarryForwardTypes";

const LeaveCarryForward = () => {
  const theme: Theme = useTheme();
  const translateTexts = useTranslator("leaveModule", "leaveCarryForward");

  const {
    setIsLeaveCarryForwardModalOpen,
    setLeaveCarryForwardModalType,
    leaveTypes,
    setCarryForwardLeaveTypes
  } = useLeaveStore((state) => state);

  const handleLeaveSync = (): void => {
    setIsLeaveCarryForwardModalOpen(true);
    const filteredCarryForwardLTypes = leaveTypes?.filter(
      (leaveType) => leaveType.isActive && leaveType.isCarryForwardEnabled
    );

    setCarryForwardLeaveTypes(filteredCarryForwardLTypes);
    leaveTypes && filteredCarryForwardLTypes.length > 0
      ? setLeaveCarryForwardModalType(LeaveCarryForwardModalTypes.CARRY_FORWARD)
      : setLeaveCarryForwardModalType(
          LeaveCarryForwardModalTypes.CARRY_FORWARD_TYPES_NOT_AVAILABLE
        );
  };

  return (
    // TODO: move styles to styles.ts
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between"
      }}
    >
      <Box id="leave-carry-forward-section-description">
        <Typography
          variant="h1"
          sx={{
            marginBottom: "1.25rem"
          }}
        >
          {translateTexts(["leaveCarryForwardSectionTitle"]) ?? ""}
        </Typography>
        <Typography
          sx={{
            maxWidth: "39.563rem"
          }}
        >
          {translateTexts(["leaveCarryForwardSectionDescription"]) ?? ""}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <ButtonV2
          variant={"secondary"}
          isFullWidth={false}
          onClick={handleLeaveSync}
          icon={<SyncIcon fill={theme.palette.primary.dark} />}
          iconPosition="end"
        >
          {translateTexts(["leaveCarryForwardSectionBtn"]) ?? ""}
        </ButtonV2>
      </Box>
      <LeaveCarryForwardModalController />
    </Box>
  );
};

export default LeaveCarryForward;
