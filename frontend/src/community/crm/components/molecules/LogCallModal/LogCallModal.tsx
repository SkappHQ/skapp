import { FC } from "react";

import LogCallModalContent from "~community/crm/components/molecules/LogCallModalContent/LogCallModalContent";

interface Props {
  onClose: () => void;
}

const LogCallModal: FC<Props> = ({ onClose }) => (
  <LogCallModalContent onClose={onClose} />
);

export default LogCallModal;
