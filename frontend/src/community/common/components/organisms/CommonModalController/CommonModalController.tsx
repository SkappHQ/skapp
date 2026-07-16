import { JSX, memo } from "react";

import { CommonModalType } from "~community/common/enums/CommonModalEnums";
import { useCommonStore } from "~community/common/stores/commonStore";
import CreateFolderModal from "~enterprise/common/components/molecules/CreateFolderModal/CreateFolderModal";

const CommonModalController = (): JSX.Element => {
  const commonModalType = useCommonStore((state) => state.commonModalType);
  const isCommonModalOpen = useCommonStore((state) => state.isCommonModalOpen);
  const closeCommonModal = useCommonStore((state) => state.closeCommonModal);

  switch (commonModalType) {
    case CommonModalType.CREATE_FOLDER:
      return (
        <CreateFolderModal
          isOpen={isCommonModalOpen}
          onClose={closeCommonModal}
        />
      );
    default:
      return <></>;
  }
};

export default memo(CommonModalController);
