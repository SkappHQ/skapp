import { Box } from "@mui/material";
import { useRouter } from "next/router";
import { JSX, useEffect, useState } from "react";

import PeopleLayout from "~community/common/components/templates/PeopleLayout/PeopleLayout";
import { ToastType } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useToast } from "~community/common/providers/ToastProvider";
import { leaveBulkUploadResponse } from "~community/leave/types/LeaveTypes";
import { useAddUserBulkEntitlementsWithoutCSV } from "~community/people/api/PeopleApi";
import AddSectionButtonWrapper from "~community/people/components/molecules/AddSectionButtonWrapper/AddSectionButtonWrapper";
import { usePeopleStore } from "~community/people/store/store";
import {
  L3EmploymentDetailsType,
  L3GeneralDetailsType
} from "~community/people/types/PeopleTypes";
import {
  handleBulkUploadResponse,
  handleSaveEntitlements
} from "~community/people/utils/directoryUtils/addNewResourceFlowUtils/entitlementDetailsFormUtils";

import EntitlementsDetailsSection from "./EntitlementsDetailsSection";
import styles from "./styles";

const EntitlementsDetailsForm = (): JSX.Element => {
  const classes = styles();

  const router = useRouter();

  const { setToastMessage } = useToast();

  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const translateText = useTranslator(
    "peopleModule",
    "addResource",
    "commonText"
  );

  const { employee, entitlementDetails } = usePeopleStore((state) => state);

  const [currentYearSuccessFlag, setCurrentYearSuccessFlag] =
    useState<boolean>(false);
  const [nextYearSuccessFlag, setNextYearSuccessFlag] =
    useState<boolean>(false);

  const onCurrentYearSuccess = (responseData: leaveBulkUploadResponse) =>
    handleBulkUploadResponse({
      responseData,
      setSuccessFlag: setCurrentYearSuccessFlag,
      translateText,
      setToastMessage
    });

  const onNextYearSuccess = (responseData: leaveBulkUploadResponse) =>
    handleBulkUploadResponse({
      responseData,
      setSuccessFlag: setNextYearSuccessFlag,
      translateText,
      setToastMessage
    });

  const onError = () =>
    setToastMessage({
      toastType: ToastType.ERROR,
      title: translateText(["entitlementErrorMessage"]),
      open: true
    });

  const {
    mutate: currentYearMutation,
    isPending: currentYearEntitlementsLoading
  } = useAddUserBulkEntitlementsWithoutCSV(onCurrentYearSuccess, onError);

  const { mutate: nextYearMutation, isPending: nextYearEntitlementsLoading } =
    useAddUserBulkEntitlementsWithoutCSV(onNextYearSuccess, onError);

  const employeeGeneralDetails = employee.personal
    ?.general as L3GeneralDetailsType;
  const employeeEmploymentDetails = employee.employment
    ?.employmentDetails as L3EmploymentDetailsType;

  useEffect(() => {
    if (isSuccess) {
      handleSaveEntitlements({
        isSuccess,
        employeeGeneralDetails,
        employeeEmploymentDetails,
        entitlementDetails,
        currentYearMutation,
        currentYearSuccessFlag,
        setCurrentYearSuccessFlag,
        nextYearMutation,
        nextYearSuccessFlag,
        setNextYearSuccessFlag
      });
    }

    // NOTE: Adding Missing Dependencies will cause a rerendering issue.
  }, [isSuccess]);

  return (
    <Box role="region" aria-labelledby="page-title subtitle-next-to-title">
      <PeopleLayout
        title={translateText(["entitlements"])}
        pageHead={translateText(["head"])}
        containerStyles={classes.layoutContainerStyles}
        dividerStyles={classes.layoutDividerStyles}
      >
        <>
          <EntitlementsDetailsSection />

          <AddSectionButtonWrapper setIsSuccess={setIsSuccess} />
        </>
      </PeopleLayout>
    </Box>
  );
};

export default EntitlementsDetailsForm;
