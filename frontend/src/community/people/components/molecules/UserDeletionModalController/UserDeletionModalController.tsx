import { Box } from "@mui/material";
import { FC } from "react";

import { usePeopleStore } from "~community/people/store/store";

import SupervisorReassignmentModal from "../SupervisorReassignmentModal/SupervisorReassignmentModal";
import UserDeletionConfirmationModal from "../UserDeletionConfirmationModal/UserDeletionConfirmationModal";
import UserDeletionWarningModal from "../UserDeletionWarningModal/UserDeletionWarningModal";

const UserDeletionModalController: FC = () => {
  const {
    isDeletionConfirmationModalOpen,
    isDeletionAlertOpen,
    setDeletionConfirmationModalOpen,
    setDeletionAlertOpen,
    deletionAlertMessage,
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
          supervisorReassignmentActionType === "delete"
        }
        onCancel={() => setIsSupervisorReassignmentModalOpen(false)}
        employeeId={Number(selectedEmployeeId)}
        actionType="delete"
        onActionSuccess={() => {
          setIsSupervisorReassignmentModalOpen(false);
        }}
      />
      <UserDeletionConfirmationModal
        isOpen={isDeletionConfirmationModalOpen}
        onClose={() => setDeletionConfirmationModalOpen(false)}
      />
      <UserDeletionWarningModal
        message={deletionAlertMessage}
        isOpen={isDeletionAlertOpen}
        onClose={() => setDeletionAlertOpen(false)}
        onClick={() => setDeletionAlertOpen(false)}
      />
    </Box>
  );
};

export default UserDeletionModalController;
