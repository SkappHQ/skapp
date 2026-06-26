import { Dispatch, SetStateAction } from "react";

import AreYouSureModal from "~community/common/components/molecules/AreYouSureModal/AreYouSureModal";
import { useLeaveStore } from "~community/leave/store/store";
import {
  CustomLeaveAllocationModalTypes,
  CustomLeaveAllocationType
} from "~community/leave/types/CustomLeaveAllocationTypes";

interface Props {
  setTempLeaveDetails: Dispatch<
    SetStateAction<CustomLeaveAllocationType | undefined>
  >;
}

const UnsavedAddLeaveModal = ({ setTempLeaveDetails }: Props) => {
  const { setCustomLeaveAllocationModalType, setIsLeaveAllocationModalOpen } =
    useLeaveStore((state) => state);

  return (
    <AreYouSureModal
      onPrimaryBtnClick={() =>
        setCustomLeaveAllocationModalType(
          CustomLeaveAllocationModalTypes.ADD_LEAVE_ALLOCATION
        )
      }
      onSecondaryBtnClick={() => {
        setTempLeaveDetails(undefined);
        setIsLeaveAllocationModalOpen(false);
      }}
    />
  );
};

export default UnsavedAddLeaveModal;
