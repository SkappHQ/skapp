import { FC } from "react";

import { DocumentResponse } from "~enterprise/common/types/DocumentFolderTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentResponse;
  count: number;
}

const FolderNotEmptyModal: FC<Props> = () => <></>;

export default FolderNotEmptyModal;
