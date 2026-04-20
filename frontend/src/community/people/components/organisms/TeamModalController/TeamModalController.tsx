import { Dispatch, FC, ReactNode, SetStateAction, useEffect, useState } from "react";

import { SmallModal } from "@rootcodelabs/skapp-ui";
import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetAllTeams } from "~community/people/api/TeamApi";
import AddEditTeamModal from "~community/people/components/molecules/TeamModals/AddEditTeamModal/AddEditTeamModal";
import DeleteConfirmModal from "~community/people/components/molecules/TeamModals/DeleteConfirmModal/DeleteConfirmModal";
import ReassignMembersModal from "~community/people/components/molecules/TeamModals/ReassignMembersModal/ReassignMembersModal";
import TeamActionModal from "~community/people/components/molecules/TeamModals/TeamActionModal/TeamActionModal";
import UnsavedAddTeamModal from "~community/people/components/molecules/TeamModals/UnsavedAddTeamModal/UnsavedAddTeamModal";
import UnsavedEditTeamModal from "~community/people/components/molecules/TeamModals/UnsavedEditTeamModal/UnsavedEditTeamModal";
import { usePeopleStore } from "~community/people/store/store";
import {
  AddTeamType,
  TeamModelTypes,
  TeamNamesType
} from "~community/people/types/TeamTypes";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

interface Props {
  setLatestTeamId?: Dispatch<SetStateAction<number | null | undefined>>;
  setIsTeamsLoading?: (value: boolean) => void;
}

const TeamModalController: FC<Props> = ({ setLatestTeamId }) => {
  const translateText = useTranslator("peopleModule", "teams");

  const { isPeopleAdmin } = useSessionData();

  const {
    isTeamModalOpen,
    teamModalType,
    currentEditingTeam,
    setTeamModalType,
    setIsTeamModalOpen,
    currentDeletingTeam,
    setProjectTeamNames
  } = usePeopleStore((state) => ({
    isTeamModalOpen: state.isTeamModalOpen,
    teamModalType: state.teamModalType,
    currentEditingTeam: state.currentEditingTeam,
    setTeamModalType: state.setTeamModalType,
    setIsTeamModalOpen: state.setIsTeamModalOpen,
    currentDeletingTeam: state.currentDeletingTeam,
    setProjectTeamNames: state.setProjectTeamNames
  }));

  const { stopAllOngoingQuickSetup } = useCommonEnterpriseStore((state) => ({
    stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
  }));

  const [tempTeamDetails, setTempTeamDetails] = useState<AddTeamType>();
  const [currentTeamFormData, setCurrentTeamFormData] = useState<AddTeamType>();


  const { isLoading: teamsIsLoading, data } = useGetAllTeams();

  const getModalTitle = (): string => {
    switch (teamModalType) {
      case TeamModelTypes.ADD_TEAM:
        return translateText(["addTeamModalTitle"]);
      case TeamModelTypes.UNSAVED_ADD_TEAM:
        return translateText(["unsavedAddModalTitle"]);
      case TeamModelTypes.EDIT_TEAM:
        return translateText(["editTeamModalTitle"]);
      case TeamModelTypes.UNSAVED_EDIT_TEAM:
        return translateText(["unsavedEditModalTitle"]);
      case TeamModelTypes.CONFIRM_DELETE:
        return translateText(["confirmDeleteModalTitle"]);
      case TeamModelTypes.REASSIGN_MEMBERS:
        return translateText(["reassignModalTitle"]);
      case TeamModelTypes.TEAM_ACTIONS:
        return translateText(["teamActionsTitle"]);
      default:
        return "";
    }
  };

  const isEditingTeamChanged = (): boolean => {
    const isTeamNameChanged =
      currentTeamFormData?.teamName !== currentEditingTeam?.teamName;

    const isTeamMembersSame =
      currentEditingTeam?.teamMembers?.every((member) => {
        return currentTeamFormData?.teamMembers?.some(
          (teamMember) => teamMember?.employeeId === member?.employeeId
        );
      }) &&
      currentEditingTeam?.teamMembers?.length ===
        currentTeamFormData?.teamMembers?.length;

    const isTeamSupervisorsSame =
      currentEditingTeam?.supervisors?.every((supervisor) => {
        return currentTeamFormData?.teamSupervisors?.some(
          (teamSupervisor) =>
            teamSupervisor?.employeeId === supervisor?.employeeId
        );
      }) &&
      currentEditingTeam?.supervisors?.length ===
        currentTeamFormData?.teamSupervisors?.length;

    return (
      isTeamNameChanged ||
      (!isTeamMembersSame as boolean) ||
      (!isTeamSupervisorsSame as boolean)
    );
  };

  const handleCloseModal = (): void => {
    if (
      teamModalType === TeamModelTypes.UNSAVED_ADD_TEAM ||
      teamModalType === TeamModelTypes.UNSAVED_EDIT_TEAM
    ) {
      return;
    }
    if (
      teamModalType === TeamModelTypes.ADD_TEAM &&
      currentTeamFormData &&
      (currentTeamFormData?.teamMembers?.length > 0 ||
        currentTeamFormData?.teamSupervisors?.length > 0 ||
        currentTeamFormData?.teamName?.length > 0)
    ) {
      setTempTeamDetails(currentTeamFormData);
      setTeamModalType(TeamModelTypes.UNSAVED_ADD_TEAM);
    } else if (
      teamModalType === TeamModelTypes.EDIT_TEAM &&
      isEditingTeamChanged()
    ) {
      setTeamModalType(TeamModelTypes.UNSAVED_EDIT_TEAM);
    } else {
      stopAllOngoingQuickSetup();
      setIsTeamModalOpen(false);
      setTeamModalType(TeamModelTypes.NONE);
    }
  };

  useEffect(() => {
    if (!teamsIsLoading && data)
      setProjectTeamNames(
        data.map(({ teamId, teamName }) => ({ teamId, teamName }))
      );
  }, [teamsIsLoading, data]);

  const modalContent = (): ReactNode => {
    switch (teamModalType) {
      case TeamModelTypes.ADD_TEAM:
        return (
          <AddEditTeamModal
            tempTeamDetails={tempTeamDetails}
            setTempTeamDetails={setTempTeamDetails}
            setCurrentTeamFormData={setCurrentTeamFormData}
            isEditingTeamChanged={isEditingTeamChanged()}
          />
        );
      case TeamModelTypes.EDIT_TEAM:
        return (
          <AddEditTeamModal
            tempTeamDetails={tempTeamDetails}
            setTempTeamDetails={setTempTeamDetails}
            setCurrentTeamFormData={setCurrentTeamFormData}
            isEditingTeamChanged={isEditingTeamChanged()}
            setLatestTeamId={setLatestTeamId}
          />
        );
      case TeamModelTypes.UNSAVED_ADD_TEAM:
        return (
          <UnsavedAddTeamModal
            setTempTeamDetails={setTempTeamDetails}
          />
        );
      case TeamModelTypes.UNSAVED_EDIT_TEAM:
        return (
          <UnsavedEditTeamModal
            tempTeamDetails={tempTeamDetails}
            setTempTeamDetails={setTempTeamDetails}
          />
        );
      case TeamModelTypes.CONFIRM_DELETE:
        return <DeleteConfirmModal />;
      case TeamModelTypes.REASSIGN_MEMBERS:
        return <ReassignMembersModal />;
      default:
        return null;
    }
  };

  return (
    <>
      <SmallModal
        isOpen={
          isTeamModalOpen &&
          teamModalType !== TeamModelTypes.TEAM_ACTIONS &&
          teamModalType !== TeamModelTypes.NONE
        }
        onClose={handleCloseModal}
        modalHeader={
          isPeopleAdmin ? getModalTitle() : translateText(["viewTeamModalTitle"])
        }
        content={modalContent()}
      />
      {teamModalType === TeamModelTypes.TEAM_ACTIONS && (
        <TeamActionModal
          isOpen={isTeamModalOpen}
          onClose={() => {
            setIsTeamModalOpen(false);
            setTeamModalType(TeamModelTypes.NONE);
          }}
          teamId={currentDeletingTeam?.teamId}
          teamName={currentDeletingTeam?.teamName}
        />
      )}
    </>
  );
};

export default TeamModalController;
