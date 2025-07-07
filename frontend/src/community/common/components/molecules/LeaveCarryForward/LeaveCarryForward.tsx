import { Box, Typography } from "@mui/material";

import SyncIcon from "~community/common/assets/Icons/SyncIcon";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import LeaveCarryForwardModalController from "~community/leave/components/organisms/LeaveCarryForwardModalController/LeaveCarryForwardModalController";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveCarryForwardModalTypes } from "~community/leave/types/LeaveCarryForwardTypes";

import Button from "../../atoms/Button/Button";

const LeaveCarryForward = () => {
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
        <Button
          label={translateTexts(["leaveCarryForwardSectionBtn"]) ?? ""}
          buttonStyle={ButtonStyle.SECONDARY}
          endIcon={<SyncIcon />}
          isFullWidth={false}
          styles={{
            paddingX: "1.75rem",
            paddingY: "1.25rem"
          }}
          onClick={handleLeaveSync}
          accessibility={{
            ariaDescribedBy: "leave-carry-forward-section-description"
          }}
        />
      </Box>
      <LeaveCarryForwardModalController />
    </Box>
  );
};

export default LeaveCarryForward;
