import { FC } from "react";

import { DocumentFolder } from "~community/common/types/DocumentFolderTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
  folder: DocumentFolder;
}

const RenameFolderModal: FC<Props> = () => <></>;

export default RenameFolderModal;
