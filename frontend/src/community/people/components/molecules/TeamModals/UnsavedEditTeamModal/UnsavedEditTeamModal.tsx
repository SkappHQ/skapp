import { Dispatch, SetStateAction } from "react";

import AreYouSureModal from "~community/common/components/molecules/AreYouSureModal/AreYouSureModal";
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
  const { setTeamModalType, setIsTeamModalOpen, setCurrentEditingTeam } =
    usePeopleStore((state) => state);

  const handleResume = () => {
    setTeamModalType(TeamModelTypes.EDIT_TEAM);
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
