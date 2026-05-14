import { Box } from "@mui/material";
import { FC } from "react";

import { usePeopleStore } from "~community/people/store/store";
import { concatStrings } from "~community/people/utils/jobFamilyUtils/commonUtils";

import SupervisorReassignmentModal from "../SupervisorReassignmentModal/SupervisorReassignmentModal";
import UserDeletionConfirmationModal from "../UserDeletionConfirmationModal/UserDeletionConfirmationModal";

const UserDeletionModalController: FC = () => {
  const {
    isDeletionConfirmationModalOpen,
    setDeletionConfirmationModalOpen,
    selectedEmployeeId,
    isSupervisorReassignmentModalOpen,
    supervisorReassignmentActionType,
    setIsSupervisorReassignmentModalOpen,
    employee
  } = usePeopleStore((state) => state);

  const employeeName = concatStrings([
    employee?.personal?.general?.firstName ?? "",
    employee?.personal?.general?.lastName ?? ""
  ]).trim();

  return (
    <Box>
      <SupervisorReassignmentModal
        isOpen={
          isSupervisorReassignmentModalOpen &&
          supervisorReassignmentActionType === "delete"
        }
        onCancel={() => setIsSupervisorReassignmentModalOpen(false)}
        employeeId={Number(selectedEmployeeId)}
        employeeName={employeeName}
        actionType="delete"
        onActionSuccess={() => setIsSupervisorReassignmentModalOpen(false)}
      />
      <UserDeletionConfirmationModal
        isOpen={isDeletionConfirmationModalOpen}
        onClose={() => setDeletionConfirmationModalOpen(false)}
      />
    </Box>
  );
};

export default UserDeletionModalController;
