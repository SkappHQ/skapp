import { Dispatch, SetStateAction } from "react";

import AreYouSureModal from "~community/common/components/molecules/AreYouSureModal/AreYouSureModal";
import { usePeopleStore } from "~community/people/store/store";
import { AddTeamType, TeamModelTypes } from "~community/people/types/TeamTypes";
import { useCommonEnterpriseStore } from "~enterprise/common/store/commonStore";

interface Props {
  setTempTeamDetails: Dispatch<SetStateAction<AddTeamType | undefined>>;
}

const UnsavedAddTeamModal = ({ setTempTeamDetails }: Props) => {
  const { setTeamModalType, setIsTeamModalOpen } = usePeopleStore((state) => ({
    setTeamModalType: state.setTeamModalType,
    setIsTeamModalOpen: state.setIsTeamModalOpen
  }));

  const { stopAllOngoingQuickSetup } = useCommonEnterpriseStore((state) => ({
    stopAllOngoingQuickSetup: state.stopAllOngoingQuickSetup
  }));

  const handleSecondaryBtnClick = () => {
    stopAllOngoingQuickSetup();
    setTempTeamDetails(undefined);
    setIsTeamModalOpen(false);
    setTeamModalType(TeamModelTypes.UNSAVED_ADD_TEAM);
  };

  return (
    <AreYouSureModal
      onPrimaryBtnClick={() => setTeamModalType(TeamModelTypes.ADD_TEAM)}
      onSecondaryBtnClick={handleSecondaryBtnClick}
    />
  );
};

export default UnsavedAddTeamModal;
