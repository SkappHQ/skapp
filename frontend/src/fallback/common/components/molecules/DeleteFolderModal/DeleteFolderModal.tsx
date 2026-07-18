import { FC } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  document: { id: number; name: string };
}

const DeleteFolderModal: FC<Props> = () => <></>;

export default DeleteFolderModal;
