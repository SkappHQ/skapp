import { FC } from "react";

import { DocumentResponse } from "~enterprise/common/types/DocumentFolderTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentResponse;
}

const DeleteDocumentModal: FC<Props> = () => <></>;

export default DeleteDocumentModal;
