import { FC, ReactNode, useEffect, useRef, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { CrmActivityAssociationMessageEnum } from "~community/crm/enums/common";

interface Props {
  submitCount: number;
  isValidating: boolean;
  isValid: boolean;
  isDealMismatch: boolean;
  isDealClearedNoticeVisible: boolean;
  isCompanyMismatch: boolean;
  children: ReactNode;
}

const ActivityAssociations: FC<Props> = ({
  submitCount,
  isValidating,
  isValid,
  isDealMismatch,
  isDealClearedNoticeVisible,
  isCompanyMismatch,
  children
}) => {
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "logActivity",
    "buttons"
  );

  const sectionRef = useRef<HTMLDivElement>(null);

  const getActiveMessage = (): CrmActivityAssociationMessageEnum | null => {
    if (isDealMismatch) return CrmActivityAssociationMessageEnum.DEAL_MISMATCH;
    if (isDealClearedNoticeVisible)
      return CrmActivityAssociationMessageEnum.DEAL_CLEARED;
    if (isCompanyMismatch)
      return CrmActivityAssociationMessageEnum.COMPANY_MISMATCH;
    return null;
  };

  const activeMessage = getActiveMessage();

  const [isOpen, setIsOpen] = useState(activeMessage !== null);
  const [lastActiveMessage, setLastActiveMessage] = useState(activeMessage);

  if (activeMessage !== lastActiveMessage) {
    setLastActiveMessage(activeMessage);
    if (activeMessage) setIsOpen(true);
  }

  const [lastSubmitCount, setLastSubmitCount] = useState(submitCount);

  if (submitCount !== lastSubmitCount) {
    setLastSubmitCount(submitCount);
    if (activeMessage && submitCount > lastSubmitCount) setIsOpen(true);
  }

  const scrollToSection = (): void => {
    sectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  };

  useEffect(() => {
    if (activeMessage) scrollToSection();
  }, [activeMessage]);

  const lastScrolledSubmitCountRef = useRef(submitCount);

  useEffect(() => {
    if (isValidating) return;
    if (
      submitCount > lastScrolledSubmitCountRef.current &&
      isValid &&
      activeMessage
    ) {
      scrollToSection();
    }
    lastScrolledSubmitCountRef.current = submitCount;
  }, [submitCount, isValidating]);

  return (
    <>
      {isOpen && (
        <div ref={sectionRef} className="flex flex-col gap-2">
          {children}
        </div>
      )}

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
