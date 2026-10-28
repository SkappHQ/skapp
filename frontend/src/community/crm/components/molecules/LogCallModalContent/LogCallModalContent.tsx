import { useFormik } from "formik";
import { FC, useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { ToastType } from "~community/common/enums/ComponentEnums";
import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { ErrorResponse } from "~community/common/types/CommonTypes";
import {
  instantInZone,
  nowInZone
} from "~community/common/utils/dateTimeUtils";
import { ActivityCallCreatePayload } from "~community/crm/activities/types/activityTypes";
import { useCreateCall } from "~community/crm/api/ActivityApi";
import LogCallModalForm from "~community/crm/components/molecules/LogCallModalForm/LogCallModalForm";
import { CrmErrorMessageKeyEnum } from "~community/crm/enums/common";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmLogCallFormValues,
  CrmOwnerEntity
} from "~community/crm/types/CrmCommonTypes";
import { getCallValidationSchema } from "~community/crm/utils/callValidations";
import { updateOwnerRecord } from "~community/crm/utils/commonUtil";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

interface Props {
  onCancel: () => void;
  onSaved: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

const LogCallModalContent: FC<Props> = ({
  onCancel,
  onSaved,
  onDirtyChange
}) => {
  const translateText = useTranslator("crmModule");
  const displayZone = useDisplayZone();
  const { setToastMessage } = useToast();

  const { owners, setOwners } = useCrmStore(
    useShallow((store) => ({
      owners: store.owners,
      setOwners: store.setOwners
    }))
  );

  const { data: currentUser } = useGetUserPersonalDetails();

  const defaultOwner = useMemo((): CrmOwnerEntity | null => {
    if (!currentUser?.employeeId) return null;

    return {
      employeeId: Number(currentUser.employeeId),
      firstName: currentUser.firstName ?? "",
      lastName: currentUser.lastName ?? "",
      authPic: currentUser.authPic as string | null
    };
  }, [
    currentUser?.employeeId,
    currentUser?.firstName,
    currentUser?.lastName,
    currentUser?.authPic
  ]);

  useEffect(() => {
    if (!defaultOwner) return;

    setOwners(updateOwnerRecord(owners, [defaultOwner]));
  }, [defaultOwner]);

  const initialValues: CrmLogCallFormValues = useMemo(() => {
    const now = nowInZone(displayZone);

    return {
      subject: "",
      date: now.toUTC().toISO(),
      time: now.toFormat(now.minute < 30 ? "HH:00" : "HH:30"),
      duration: "",
      contactId: null,
      ownerId: defaultOwner ? defaultOwner.employeeId : null,
      comments: "",
      dealId: null,
      companyId: null
    };
  }, [defaultOwner, displayZone]);

  const toPayload = (
    values: CrmLogCallFormValues,
    contactId: number,
    ownerId: number
  ): ActivityCallCreatePayload => {
    const [hour, minute] = values.time.split(":").map(Number);
    const loggedAt = values.date
      ? instantInZone(values.date, displayZone)
          .set({ hour, minute, second: 0, millisecond: 0 })
          .toUTC()
          .toISO()
      : null;
    const comments = values.comments.trim();

    return {
      subject: values.subject.trim(),
      contactId,
      ownerId,
      ...(loggedAt ? { loggedAt } : {}),
      ...(values.duration ? { durationMinutes: Number(values.duration) } : {}),
      ...(values.dealId ? { dealId: values.dealId } : {}),
      ...(values.companyId ? { companyId: values.companyId } : {}),
      ...(comments ? { comments } : {})
    };
  };

  const handleSubmit = (values: CrmLogCallFormValues): void => {
    if (!values.contactId || !values.ownerId) return;

    createCall(toPayload(values, values.contactId, values.ownerId));
  };

  const formik = useFormik<CrmLogCallFormValues>({
    initialValues,
    validationSchema: getCallValidationSchema(translateText),
    onSubmit: handleSubmit,
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  const { dirty, setSubmitting, setFieldError } = formik;

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty]);

  const handleSuccess = (): void => {
    setSubmitting(false);
    onSaved();
  };

  const handleError = (error: ErrorResponse): void => {
    setSubmitting(false);

    if (
      error.response?.data?.results?.[0]?.messageKey ===
      CrmErrorMessageKeyEnum.ACTIVITY_CALL_DEAL_COMPANY_MISMATCH
    ) {
      setFieldError(
        "dealId",
        translateText([
          "activities",
          "logCall",
          "modal",
          "validations",
          "dealMismatch"
        ])
      );
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

  return (
    <LogCallModalForm
      formik={formik}
      isPending={isPending}
      onCancel={onCancel}
    />
  );
};

export default LogCallModalContent;
