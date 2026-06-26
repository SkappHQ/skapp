import { Dispatch, SetStateAction } from "react";

import AreYouSureModal from "~community/common/components/molecules/AreYouSureModal/AreYouSureModal";
import { useLeaveStore } from "~community/leave/store/store";
import {
  CustomLeaveAllocationModalTypes,
  CustomLeaveAllocationType
} from "~community/leave/types/CustomLeaveAllocationTypes";

interface Props {
  setTempLeaveAllocationDetails: Dispatch<
    SetStateAction<CustomLeaveAllocationType | undefined>
  >;
  onResume: () => void;
}

const UnsavedLeaveAllocationModal = ({
  setTempLeaveAllocationDetails,
  onResume
}: Props) => {
  const { setCustomLeaveAllocationModalType, setIsLeaveAllocationModalOpen } =
    useLeaveStore((state) => state);

  return (
    <AreYouSureModal
      onPrimaryBtnClick={onResume}
      onSecondaryBtnClick={() => {
        setTempLeaveAllocationDetails(undefined);
        setIsLeaveAllocationModalOpen(false);
        setCustomLeaveAllocationModalType(CustomLeaveAllocationModalTypes.NONE);
      }}
    />
  );
};

export default UnsavedLeaveAllocationModal;
