import { useFormik } from "formik";
import { DateTime } from "luxon";
import { FC, useMemo } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import LogCallModalForm from "~community/crm/components/molecules/LogCallModalForm/LogCallModalForm";
import {
  CALL_TIME_SLOT_MINUTES,
  CALL_TIME_VALUE_FORMAT
} from "~community/crm/constants/callConstants";
import { useDefaultCrmOwner } from "~community/crm/hooks/useDefaultCrmOwner";
import { CrmLogCallFormValues } from "~community/crm/types/CrmCommonTypes";
import { getCallValidationSchema } from "~community/crm/utils/callValidations";

interface Props {
  onCancel: () => void;
}

const LogCallModalContent: FC<Props> = ({ onCancel }) => {
  const translateText = useTranslator("crmModule");

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

  const validationSchema = useMemo(
    () => getCallValidationSchema(translateText),
    [translateText]
  );

  const formik = useFormik<CrmLogCallFormValues>({
    initialValues,
    validationSchema,
    onSubmit: () => {},
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  return <LogCallModalForm formik={formik} onCancel={onCancel} />;
};

export default LogCallModalContent;
