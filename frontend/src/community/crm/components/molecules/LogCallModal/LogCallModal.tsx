import { FC } from "react";

import LogCallModalContent from "~community/crm/components/molecules/LogCallModalContent/LogCallModalContent";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const LogCallModal: FC<Props> = ({ isOpen, onClose }) =>
  isOpen ? <LogCallModalContent onClose={onClose} /> : null;

export default LogCallModal;
