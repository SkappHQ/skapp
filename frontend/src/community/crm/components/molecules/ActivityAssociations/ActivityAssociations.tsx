import { FC, ReactNode } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

const ActivityAssociations: FC<Props> = ({ isOpen, onToggle, children }) => {
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "logActivity",
    "buttons"
  );

  return (
    <>
      {isOpen && children}

      <button
        type="button"
        className="self-start text-sm text-primary-text underline"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        {isOpen
          ? translateText(["hideAssociations"])
          : translateText(["addAssociations"])}
      </button>
    </>
  );
};

export default ActivityAssociations;
