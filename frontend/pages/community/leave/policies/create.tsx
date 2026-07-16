import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { JSX, useEffect } from "react";

import ROUTES from "~community/common/constants/routes";
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

  const renderWizard = (): JSX.Element | null => {
    if (!policyType) {
      return null;
    }

    return (
      <div className="h-full p-4 sm:px-12 sm:py-6">
        <LeavePolicyWizard policyType={policyType} />
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>{translateText(["pageHead"])}</title>
      </Head>
      {renderWizard()}
    </>
  );
};

export default CreateLeavePolicy;
