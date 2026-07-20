import { JSX, memo } from "react";

import { CommonModalType } from "~community/common/enums/CommonModalEnums";
import { useCommonStore } from "~community/common/stores/commonStore";
import ConfirmDeleteModal from "~enterprise/common/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal";
import CreateFolderModal from "~enterprise/common/components/molecules/CreateFolderModal/CreateFolderModal";
import RenameFolderModal from "~enterprise/common/components/molecules/RenameFolderModal/RenameFolderModal";
import UploadDocumentModal from "~enterprise/common/components/molecules/UploadDocumentModal/UploadDocumentModal";

const CommonModalController = (): JSX.Element => {
  const commonModalType = useCommonStore((state) => state.commonModalType);
  const isCommonModalOpen = useCommonStore((state) => state.isCommonModalOpen);
  const commonModalData = useCommonStore((state) => state.commonModalData);
  const closeCommonModal = useCommonStore((state) => state.closeCommonModal);

  switch (commonModalType) {
    case CommonModalType.CREATE_FOLDER:
      return (
        <CreateFolderModal
          isOpen={isCommonModalOpen}
          onClose={closeCommonModal}
          employeeId={commonModalData?.employeeId!}
        />
      );
    case CommonModalType.RENAME_FOLDER:
      return (
        <RenameFolderModal
          isOpen={isCommonModalOpen}
          onClose={closeCommonModal}
          employeeId={commonModalData?.employeeId!}
          folder={commonModalData?.folder!}
        />
      );
    case CommonModalType.UPLOAD_DOCUMENT:
      return (
        <UploadDocumentModal
          isOpen={isCommonModalOpen}
          onClose={closeCommonModal}
          employeeId={commonModalData?.employeeId!}
          parentId={commonModalData?.parentId!}
        />
      );
    case CommonModalType.DELETE_DOCUMENT:
      return (
        <ConfirmDeleteModal
          isOpen={isCommonModalOpen}
          onClose={closeCommonModal}
          document={commonModalData?.document!}
        />
      );
    default:
      return <></>;
  }
};

export default memo(CommonModalController);
