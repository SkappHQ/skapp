import { SidePanel } from "@rootcodelabs/skapp-ui";

const CompanySidePanel: React.FC<{
  company: any;
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default CompanySidePanel;
