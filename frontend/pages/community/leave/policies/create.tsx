import { NextPage } from "next";
import Head from "next/head";

import { useTranslator } from "~community/common/hooks/useTranslator";
import LeavePolicyWizard from "~community/leave/components/organisms/LeavePolicyWizard/LeavePolicyWizard";

const CreateLeavePolicy: NextPage = () => {
  const translateText = useTranslator(
    "leaveModule",
    "leavePolicies",
    "createPolicy"
  );

  return (
    <>
      <Head>
        <title>{translateText(["pageHead"])}</title>
      </Head>
      <div className="h-full p-4 sm:px-12 sm:py-6">
        <LeavePolicyWizard />
      </div>
    </>
  );
};

export default CreateLeavePolicy;
