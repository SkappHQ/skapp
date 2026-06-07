import { SidePanel } from "@rootcodelabs/skapp-ui";

import { CrmCompanyMetricsType } from "~community/crm/types/CommonTypes";

const CompanySidePanel: React.FC<{
  company: CrmCompanyMetricsType | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  return <SidePanel isOpen={isOpen} onClose={onClose} />;
};

export default CompanySidePanel;
