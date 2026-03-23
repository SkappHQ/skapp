import { Dispatch, SetStateAction } from "react";

import AreYouSureModal from "~community/common/components/molecules/AreYouSureModal/AreYouSureModal";
import { useUpdateTeam } from "~community/people/api/TeamApi";
import { usePeopleStore } from "~community/people/store/store";
import { AddTeamType, TeamModelTypes } from "~community/people/types/TeamTypes";

interface Props {
  tempTeamDetails: AddTeamType | undefined;
  setTempTeamDetails: Dispatch<SetStateAction<AddTeamType | undefined>>;
}

const UnsavedEditTeamModal = ({
  tempTeamDetails,
  setTempTeamDetails
}: Props) => {
  const {
    currentEditingTeam,
    setTeamModalType,
    setIsTeamModalOpen,
    setCurrentEditingTeam
  } = usePeopleStore((state) => state);

  const onUpdateSuccess = () => {
    setIsTeamModalOpen(false);
    setTeamModalType(TeamModelTypes.EDIT_TEAM);
    // TODO: show toast
  };

  const onUpdateError = () => {
    // TODO: show toast
  };

  const { mutate: updateTeamMutate } = useUpdateTeam(
    onUpdateSuccess,
    onUpdateError
  );

  const handleResume = () => {
    if (
      !tempTeamDetails?.teamName ||
      tempTeamDetails.teamSupervisors?.length === 0
    ) {
      setTeamModalType(TeamModelTypes.EDIT_TEAM);
    } else {
      updateTeamMutate({
        teamId: currentEditingTeam?.teamId as number,
        teamName: tempTeamDetails.teamName,
        teamSupervisors: tempTeamDetails.teamSupervisors,
        teamMembers: tempTeamDetails.teamMembers
      });
      setTempTeamDetails(undefined);
      setCurrentEditingTeam(undefined);
      setIsTeamModalOpen(false);
      setTeamModalType(TeamModelTypes.NONE);
    }
  };

  const handleLeaveAnyway = () => {
    setIsTeamModalOpen(false);
    setTeamModalType(TeamModelTypes.NONE);
    setCurrentEditingTeam(undefined);
    setTempTeamDetails(undefined);
  };

  return (
    <AreYouSureModal
      onPrimaryBtnClick={handleResume}
      onSecondaryBtnClick={handleLeaveAnyway}
    />
  );
};

export default UnsavedEditTeamModal;
