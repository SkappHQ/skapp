import { FC } from "react";

import { DocumentResponse } from "~enterprise/common/types/DocumentFolderTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentResponse;
  employeeId: number;
}

const MoveDocumentModal: FC<Props> = () => <></>;

export default MoveDocumentModal;
