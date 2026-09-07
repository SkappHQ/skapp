"use client";

import { NextPage } from "next";
import { useEffect } from "react";

import PageTitle from "~community/common/components/atoms/PageTitle/PageTitle";
import ROUTES from "~community/common/constants/routes";
import useRouter from "~community/common/hooks/useCompatRouter";
import { useTranslator } from "~community/common/hooks/useTranslator";
import LeavePolicyWizard from "~community/leave/components/organisms/LeavePolicyWizard/LeavePolicyWizard";
import { PolicyType } from "~community/leave/types/LeavePolicyTypes";

const CreateLeavePolicy: NextPage = () => {
  const router = useRouter();

  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy"
  );

  const typeParam = router.query.type;
  const policyType =
    typeParam === PolicyType.ACCRUAL || typeParam === PolicyType.FLEXIBLE
      ? (typeParam as PolicyType)
      : null;

  useEffect(() => {
    if (router.isReady && !policyType) {
      router.replace(ROUTES.LEAVE.LEAVE_POLICIES);
    }
  }, [router, router.isReady, policyType]);

  return (
    <>
      <PageTitle title={translateText(["pageHead"])} />
      {policyType && (
        <div className="h-full p-4 sm:px-12 sm:py-6">
          <LeavePolicyWizard policyType={policyType} />
        </div>
      )}
    </>
  );
};

export default CreateLeavePolicy;
