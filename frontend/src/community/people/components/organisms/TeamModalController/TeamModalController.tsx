import { SmallModal } from "@rootcodelabs/skapp-ui";
import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState
} from "react";

import useSessionData from "~community/common/hooks/useSessionData";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import {
  useGetAllTeams,
  useGetMemberTeams
} from "~community/people/api/TeamApi";
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
  TeamNamesType,
  TransferableMember
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

  const { setToastMessage } = useToast();

  const [tempTeamDetails, setTempTeamDetails] = useState<AddTeamType>();
  const [currentTeamFormData, setCurrentTeamFormData] = useState<AddTeamType>();

  const { isLoading: teamsIsLoading, data: allTeams } = useGetAllTeams();

  const {
    data: memberTeams,
    isLoading: memberTeamsLoading,
    isError: memberTeamsError
  } = useGetMemberTeams(Number(currentDeletingTeam?.teamId));

  const transferableMembers = useMemo<TransferableMember[]>(() => {
    if (!memberTeams || !allTeams) return [];
    const deletingTeamId = Number(currentDeletingTeam?.teamId);
    const otherTeams = allTeams.filter(
      (t) => Number(t.teamId) !== deletingTeamId
    );
    return memberTeams
      .map((member) => ({
        employeeId: member.employeeId,
        transferableTeams: otherTeams.filter(
          (t) => !member.teamIds.includes(Number(t.teamId))
        )
      }))
      .filter((member) => member.transferableTeams.length > 0);
  }, [memberTeams, allTeams, currentDeletingTeam]);

  const hasTransferableMembers = transferableMembers.length > 0;
  const isLoadingMemberData = memberTeamsLoading || teamsIsLoading;

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
    if (!teamsIsLoading && allTeams)
      setProjectTeamNames(allTeams as TeamNamesType[]);
  }, [teamsIsLoading, allTeams]);

  useEffect(() => {
    if (memberTeamsError) {
      setToastMessage({
        open: true,
        toastType: "error",
        title: translateText(["teamDeleteFailTitle"]),
        description: translateText(["teamDeleteFailDes"]),
        isIcon: true
      });
    }
  }, [memberTeamsError]);

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
        return <UnsavedAddTeamModal setTempTeamDetails={setTempTeamDetails} />;
      case TeamModelTypes.UNSAVED_EDIT_TEAM:
        return (
          <UnsavedEditTeamModal
            tempTeamDetails={tempTeamDetails}
            setTempTeamDetails={setTempTeamDetails}
          />
        );
      case TeamModelTypes.CONFIRM_DELETE:
        return (
          <DeleteConfirmModal
            hasTransferableMembers={hasTransferableMembers}
            isLoadingMemberData={isLoadingMemberData}
          />
        );
      case TeamModelTypes.REASSIGN_MEMBERS:
        return (
          <ReassignMembersModal transferableMembers={transferableMembers} />
        );
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
          isPeopleAdmin
            ? getModalTitle()
            : translateText(["viewTeamModalTitle"])
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
