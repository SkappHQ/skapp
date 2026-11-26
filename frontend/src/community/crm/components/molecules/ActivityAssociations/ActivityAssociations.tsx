import { FC, ReactNode, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";

interface Props {
  isForcedOpen: boolean;
  submitCount: number;
  children: ReactNode;
}

const ActivityAssociations: FC<Props> = ({
  isForcedOpen,
  submitCount,
  children
}) => {
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "logActivity",
    "buttons"
  );

  const [isOpen, setIsOpen] = useState(isForcedOpen);
  const [wasForcedOpen, setWasForcedOpen] = useState(isForcedOpen);

  if (isForcedOpen !== wasForcedOpen) {
    setWasForcedOpen(isForcedOpen);
    if (isForcedOpen) setIsOpen(true);
  }

  const [lastSubmitCount, setLastSubmitCount] = useState(submitCount);

  if (submitCount !== lastSubmitCount) {
    setLastSubmitCount(submitCount);
    if (isForcedOpen) setIsOpen(true);
  }

  return (
    <>
      {isOpen && children}

      <button
        type="button"
        className="self-start text-sm text-primary-text underline"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen
          ? translateText(["hideAssociations"])
          : translateText(["addAssociations"])}
      </button>
    </>
  );
};

export default ActivityAssociations;
