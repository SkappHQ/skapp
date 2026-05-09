import { Box } from "@mui/material";
import { FC } from "react";

import { usePeopleStore } from "~community/people/store/store";

import SupervisorReassignmentModal from "../SupervisorReassignmentModal/SupervisorReassignmentModal";
import TerminateConfirmationModal from "../TerminateConfirmationModal/TerminateConfirmationModal";

const TerminationModalController: FC = () => {
  const {
    isTerminationConfirmationModalOpen,
    setTerminationConfirmationModalOpen,
    selectedEmployeeId,
    isSupervisorReassignmentModalOpen,
    supervisorReassignmentActionType,
    setIsSupervisorReassignmentModalOpen,
    employee
  } = usePeopleStore((state) => state);

  const employeeName =
    `${employee?.personal?.general?.firstName ?? ""} ${employee?.personal?.general?.lastName ?? ""}`.trim();

  return (
    <Box>
      <SupervisorReassignmentModal
        isOpen={
          isSupervisorReassignmentModalOpen &&
          supervisorReassignmentActionType === "terminate"
        }
        onCancel={() => setIsSupervisorReassignmentModalOpen(false)}
        employeeId={Number(selectedEmployeeId)}
        employeeName={employeeName}
        actionType="terminate"
        onActionSuccess={() => setIsSupervisorReassignmentModalOpen(false)}
      />
      <TerminateConfirmationModal
        isOpen={isTerminationConfirmationModalOpen}
        onClose={() => setTerminationConfirmationModalOpen(false)}
      />
    </Box>
  );
};

export default TerminationModalController;
