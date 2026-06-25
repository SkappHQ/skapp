import type { CrmLimitResource } from "~enterprise/crm/types/CrmLimitTypes";

interface CrmLimitUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: CrmLimitResource | null;
}

const CrmLimitUpgradeModal = (_props: CrmLimitUpgradeModalProps) => null;

export default CrmLimitUpgradeModal;
