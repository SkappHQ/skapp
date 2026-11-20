import { FormikProps } from "formik";
import { useState } from "react";

import {
  CrmAddTaskFormValues,
  CrmContactEntity,
  CrmLogCallFormValues,
  CrmLogEmailFormValues,
  CrmLogMeetingFormValues
} from "~community/crm/types/CrmCommonTypes";
import { CrmScheduleMeetingFormValues } from "~enterprise/crm/types/ScheduleMeetingTypes";

export const useRelatedToAutoFill = (
  formik:
    | FormikProps<CrmLogCallFormValues>
    | FormikProps<CrmLogMeetingFormValues>
    | FormikProps<CrmAddTaskFormValues>
    | FormikProps<CrmLogEmailFormValues>
    | FormikProps<CrmScheduleMeetingFormValues>,
  fillsRelatedTo?: boolean
): ((contact: CrmContactEntity) => void) => {
  const { values, setFieldValue } = formik;

  const [hasFilledRelatedTo, setHasFilledRelatedTo] = useState(false);

  const fillRelatedToFromContact = (contact: CrmContactEntity): void => {
    if (
      fillsRelatedTo &&
      !hasFilledRelatedTo &&
      !values.companyId &&
      contact.companyId
    ) {
      setFieldValue("companyId", contact.companyId);
      setHasFilledRelatedTo(true);
    }
  };

  return fillRelatedToFromContact;
};
