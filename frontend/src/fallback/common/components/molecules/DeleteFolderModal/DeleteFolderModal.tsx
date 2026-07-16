import { FC } from "react";

import { DocumentFolder } from "~community/common/types/DocumentFolderTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  folder: DocumentFolder;
}

const DeleteFolderModal: FC<Props> = () => <></>;

export default DeleteFolderModal;
