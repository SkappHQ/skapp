import { Box } from "@mui/material";
import { FC } from "react";

import { usePeopleStore } from "~community/people/store/store";

import SupervisorReassignmentModal from "../SupervisorReassignmentModal/SupervisorReassignmentModal";
import TerminateConfirmationModal from "../TerminateConfirmationModal/TerminateConfirmationModal";
import TerminationWarningModal from "../TerminationWarningModal/TerminationWarningModal";

const TerminationModalController: FC = () => {
  const {
    isTerminationConfirmationModalOpen,
    alertMessage,
    setTerminationConfirmationModalOpen,
    setTerminationAlertModalOpen,
    isTerminationAlertModalOpen,
    selectedEmployeeId,
    isSupervisorReassignmentModalOpen,
    supervisorReassignmentActionType,
    setIsSupervisorReassignmentModalOpen
  } = usePeopleStore((state) => state);

  return (
    <Box>
      <SupervisorReassignmentModal
        isOpen={
          isSupervisorReassignmentModalOpen &&
          supervisorReassignmentActionType === "terminate"
        }
        onCancel={() => setIsSupervisorReassignmentModalOpen(false)}
        employeeId={Number(selectedEmployeeId)}
        actionType="terminate"
        onActionSuccess={() => {
          setIsSupervisorReassignmentModalOpen(false);
        }}
      />
      <TerminateConfirmationModal
        isOpen={isTerminationConfirmationModalOpen}
        onClose={() => setTerminationConfirmationModalOpen(false)}
      />
      <TerminationWarningModal
        message={alertMessage}
        isOpen={isTerminationAlertModalOpen}
        onClose={() => setTerminationAlertModalOpen(false)}
        onClick={() => setTerminationAlertModalOpen(false)}
      />
    </Box>
  );
};

export default TerminationModalController;
