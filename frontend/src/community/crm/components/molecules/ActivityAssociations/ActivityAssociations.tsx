import { FormikProps } from "formik";
import { FC, ReactNode, useEffect, useRef, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  CrmAddTaskFormValues,
  CrmLogCallFormValues,
  CrmLogEmailFormValues,
  CrmLogMeetingFormValues
} from "~community/crm/types/CrmCommonTypes";
import { CrmScheduleMeetingFormValues } from "~enterprise/crm/types/ScheduleMeetingTypes";

interface Props {
  formik:
    | FormikProps<CrmLogCallFormValues>
    | FormikProps<CrmLogMeetingFormValues>
    | FormikProps<CrmAddTaskFormValues>
    | FormikProps<CrmLogEmailFormValues>
    | FormikProps<CrmScheduleMeetingFormValues>;
  dealFieldId: string;
  relatedToFieldId: string;
  isDealMismatch: boolean;
  isDealClearedNoticeVisible: boolean;
  isCompanyMismatch: boolean;
  children: ReactNode;
}

const ActivityAssociations: FC<Props> = ({
  formik,
  dealFieldId,
  relatedToFieldId,
  isDealMismatch,
  isDealClearedNoticeVisible,
  isCompanyMismatch,
  children
}) => {
  const { submitCount, isValidating, isValid } = formik;

  const translateText = useTranslator(
    "crmModule",
    "activities",
    "logActivity",
    "buttons"
  );

  const isForcedOpen =
    isDealMismatch || isDealClearedNoticeVisible || isCompanyMismatch;

  const [isOpen, setIsOpen] = useState(isForcedOpen);
  const [wasForcedOpen, setWasForcedOpen] = useState(isForcedOpen);

  if (isForcedOpen !== wasForcedOpen) {
    setWasForcedOpen(isForcedOpen);
    if (isForcedOpen) setIsOpen(true);
  }

  const [lastSubmitCount, setLastSubmitCount] = useState(submitCount);

  if (submitCount !== lastSubmitCount) {
    setLastSubmitCount(submitCount);
    if (isForcedOpen && submitCount > lastSubmitCount) setIsOpen(true);
  }

  const getMessageId = (): string => {
    if (isDealMismatch) return `${dealFieldId}-input`;
    if (isDealClearedNoticeVisible) return `${dealFieldId}-cleared`;
    return `${relatedToFieldId}-mismatch`;
  };

  const messageId = isForcedOpen ? getMessageId() : "";

  const scrollToMessage = (): void => {
    document
      .getElementById(messageId)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    if (messageId) scrollToMessage();
  }, [messageId]);

  const lastScrolledSubmitCountRef = useRef(submitCount);

  useEffect(() => {
    if (isValidating) return;
    if (
      submitCount > lastScrolledSubmitCountRef.current &&
      isValid &&
      messageId
    ) {
      scrollToMessage();
    }
    lastScrolledSubmitCountRef.current = submitCount;
  }, [submitCount, isValidating]);

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
