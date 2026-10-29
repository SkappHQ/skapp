import { SmallModal } from "@rootcodelabs/skapp-ui";
import { FormikHelpers, useFormik } from "formik";
import { DateTime } from "luxon";
import { FC, useMemo, useState } from "react";

import AreYouSureModal from "~community/common/components/molecules/AreYouSureModal/AreYouSureModal";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ErrorResponse } from "~community/common/types/CommonTypes";
import { ActivityCallCreatePayload } from "~community/crm/activities/types/activityTypes";
import { useCreateCall } from "~community/crm/api/ActivityApi";
import LogCallModalForm from "~community/crm/components/molecules/LogCallModalForm/LogCallModalForm";
import {
  CALL_TIME_SLOT_MINUTES,
  CALL_TIME_VALUE_FORMAT
} from "~community/crm/constants/callConstants";
import { CrmErrorMessageKeyEnum } from "~community/crm/enums/common";
import { useDefaultCrmOwner } from "~community/crm/hooks/useDefaultCrmOwner";
import { CrmLogCallFormValues } from "~community/crm/types/CrmCommonTypes";
import {
  getCallValidationSchema,
  parseCallDurationToMinutes
} from "~community/crm/utils/callValidations";

interface Props {
  onClose: () => void;
}

const LogCallModalContent: FC<Props> = ({ onClose }) => {
  const translateText = useTranslator("crmModule");
  const translateCommon = useTranslator(
    "commonComponents",
    "userPromptModal",
    "unsavedChangesModal"
  );
  const { setToastMessage } = useToast();

  const [isDiscardPromptOpen, setIsDiscardPromptOpen] = useState(false);

  const defaultOwner = useDefaultCrmOwner();

  const initialValues: CrmLogCallFormValues = useMemo(() => {
    const now = DateTime.now();
    const slotStart = now.set({
      minute: now.minute - (now.minute % CALL_TIME_SLOT_MINUTES)
    });

    return {
      subject: "",
      date: now.toUTC().toISO(),
      time: slotStart.toFormat(CALL_TIME_VALUE_FORMAT),
      duration: "",
      contactId: null,
      ownerId: defaultOwner ? defaultOwner.employeeId : null,
      comments: "",
      dealId: null,
      companyId: null
    };
  }, [defaultOwner]);

  const toPayload = (
    values: CrmLogCallFormValues,
    contactId: number,
    ownerId: number
  ): ActivityCallCreatePayload => {
    const [hour, minute] = values.time.split(":").map(Number);

    return {
      subject: values.subject.trim(),
      loggedAt: values.date
        ? DateTime.fromISO(values.date)
            .set({ hour, minute })
            .startOf("minute")
            .toUTC()
            .toISO()
        : null,
      durationMinutes: parseCallDurationToMinutes(values.duration),
      contactId,
      ownerId,
      dealId: values.dealId,
      companyId: values.companyId,
      comments: values.comments.trim()
    };
  };

  const handleSubmit = (
    values: CrmLogCallFormValues,
    helpers: FormikHelpers<CrmLogCallFormValues>
  ): void => {
    if (!values.contactId || !values.ownerId) {
      helpers.setSubmitting(false);
      return;
    }

    createCall(toPayload(values, values.contactId, values.ownerId));
  };

  const validationSchema = useMemo(
    () => getCallValidationSchema(translateText),
    [translateText]
  );

  const formik = useFormik<CrmLogCallFormValues>({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { values, dirty, setSubmitting, setStatus } = formik;

  const handleSuccess = (): void => {
    setSubmitting(false);
    onClose();
    setToastMessage({
      open: true,
      toastType: ToastType.SUCCESS,
      title: translateText([
        "activities",
        "logCall",
        "modal",
        "toastMessages",
        "addSuccessTitle"
      ]),
      description: translateText([
        "activities",
        "logCall",
        "modal",
        "toastMessages",
        "addSuccessDescription"
      ])
    });
  };

  const handleError = (error: ErrorResponse): void => {
    setSubmitting(false);

    if (
      error.response?.data?.results?.[0]?.messageKey ===
      CrmErrorMessageKeyEnum.ACTIVITY_CALL_DEAL_COMPANY_MISMATCH
    ) {
      setStatus({
        mismatchedDealId: values.dealId,
        mismatchedContactId: values.contactId
      });
      requestAnimationFrame(() => {
        document.getElementById("log-call-deal-input")?.focus();
      });
      return;
    }

    setToastMessage({
      open: true,
      toastType: ToastType.ERROR,
      title: translateText([
        "activities",
        "logCall",
        "modal",
        "toastMessages",
        "errorTitle"
      ]),
      description: translateText([
        "activities",
        "logCall",
        "modal",
        "toastMessages",
        "errorDescription"
      ]),
      isIcon: true
    });
  };

  const { mutate: createCall, isPending } = useCreateCall(
    handleSuccess,
    handleError
  );

  const handleRequestClose = (): void => {
    if (isPending) return;

    if (dirty && !isDiscardPromptOpen) {
      setIsDiscardPromptOpen(true);
      return;
    }

    onClose();
  };

  return (
    <SmallModal
      isOpen
      onClose={handleRequestClose}
      modalHeader={
        isDiscardPromptOpen
          ? translateCommon(["title"])
          : translateText(["activities", "logCall", "modal", "title"])
      }
      content={
        <>
          {isDiscardPromptOpen && (
            <AreYouSureModal
              onPrimaryBtnClick={() => setIsDiscardPromptOpen(false)}
              onSecondaryBtnClick={onClose}
            />
          )}
          <div className={isDiscardPromptOpen ? "hidden" : "contents"}>
            <LogCallModalForm
              formik={formik}
              isPending={isPending}
              onCancel={handleRequestClose}
            />
          </div>
        </>
      }
    />
  );
};

export default LogCallModalContent;
