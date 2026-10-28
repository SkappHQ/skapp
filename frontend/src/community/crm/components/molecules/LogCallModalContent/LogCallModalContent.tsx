import { useFormik } from "formik";
import { FC, useMemo } from "react";
import * as Yup from "yup";

import { characterLengths } from "~community/common/constants/stringConstants";
import { useTranslator } from "~community/common/hooks/useTranslator";
import LogCallModalForm from "~community/crm/components/molecules/LogCallModalForm/LogCallModalForm";
import { useCurrentUserAsCrmOwner } from "~community/crm/hooks/useCurrentUserAsCrmOwner";
import { CrmLogCallFormValues } from "~community/crm/types/CrmCommonTypes";

interface Props {
  onCancel: () => void;
}

const LogCallModalContent: FC<Props> = ({ onCancel }) => {
  const translateText = useTranslator("crmModule");

  const defaultOwner = useCurrentUserAsCrmOwner();

  const initialValues: CrmLogCallFormValues = useMemo(
    () => ({
      subject: "",
      date: null,
      time: "",
      duration: "",
      contact: "",
      ownerId: defaultOwner ? defaultOwner.employeeId : null,
      comments: "",
      deal: "",
      company: ""
    }),
    [defaultOwner]
  );

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        subject: Yup.string()
          .trim()
          .required(
            translateText([
              "activities",
              "logCall",
              "modal",
              "validations",
              "subject"
            ])
          )
          .max(
            characterLengths.CALL_SUBJECT_LENGTH,
            translateText([
              "activities",
              "logCall",
              "modal",
              "validations",
              "subjectLength"
            ])
          ),
        contact: Yup.string()
          .trim()
          .required(
            translateText([
              "activities",
              "logCall",
              "modal",
              "validations",
              "contact"
            ])
          ),
        duration: Yup.string().matches(
          /^\d*$/,
          translateText([
            "activities",
            "logCall",
            "modal",
            "validations",
            "duration"
          ])
        ),
        comments: Yup.string().max(
          characterLengths.CALL_COMMENTS_LENGTH,
          translateText([
            "activities",
            "logCall",
            "modal",
            "validations",
            "commentsLength"
          ])
        )
      }),
    [translateText]
  );

  const formik = useFormik<CrmLogCallFormValues>({
    initialValues,
    validationSchema,
    onSubmit: (_values, helpers) => helpers.setSubmitting(false),
    validateOnChange: false,
    validateOnBlur: true,
    enableReinitialize: true
  });

  return <LogCallModalForm formik={formik} onCancel={onCancel} />;
};

export default LogCallModalContent;
