import { useFormik } from "formik";
import { FC, useEffect, useMemo } from "react";
import * as Yup from "yup";
import { useShallow } from "zustand/react/shallow";

import { useDisplayZone } from "~community/common/hooks/useDisplayZone";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { nowInZone } from "~community/common/utils/dateTimeUtils";
import LogCallModalForm from "~community/crm/components/molecules/LogCallModalForm/LogCallModalForm";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmLogCallFormValues,
  CrmOwnerEntity
} from "~community/crm/types/CrmCommonTypes";
import { updateOwnerRecord } from "~community/crm/utils/commonUtil";
import { useGetUserPersonalDetails } from "~community/people/api/PeopleApi";

interface Props {
  onCancel: () => void;
}

const LogCallModalContent: FC<Props> = ({ onCancel }) => {
  const translateText = useTranslator(
    "crmModule",
    "activities",
    "logCall",
    "modal"
  );
  const displayZone = useDisplayZone();

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
      time: now.toFormat("HH:mm"),
      duration: "",
      contact: "",
      ownerId: defaultOwner ? defaultOwner.employeeId : null,
      comments: "",
      deal: "",
      company: ""
    };
  }, [defaultOwner, displayZone]);

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        subject: Yup.string()
          .trim()
          .required(translateText(["validations", "subject"])),
        contact: Yup.string()
          .trim()
          .required(translateText(["validations", "contact"]))
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
