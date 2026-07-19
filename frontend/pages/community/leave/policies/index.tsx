import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import LeavePoliciesTable from "~community/leave/components/molecules/LeavePoliciesTable/LeavePoliciesTable";
import PolicyTypeSelectionModal from "~community/leave/components/molecules/PolicyTypeSelectionModal/PolicyTypeSelectionModal";
import { POLICY_TYPE_SELECT_QUERY } from "~community/leave/constants/leavePolicyConstants";
import useCanManageLeavePolicies from "~community/leave/hooks/useCanManageLeavePolicies";
import { PolicyType } from "~community/leave/types/LeavePolicyTypes";

const LeavePolicies: NextPage = () => {
  const translateText = useTranslator("leaveModule", "leavePolicies");

  const router = useRouter();
  const canManagePolicies = useCanManageLeavePolicies();

  const [isPolicyTypeModalOpen, setIsPolicyTypeModalOpen] =
    useState<boolean>(false);

  useEffect(() => {
    if (
      router.isReady &&
      router.query.action === POLICY_TYPE_SELECT_QUERY &&
      canManagePolicies
    ) {
      setIsPolicyTypeModalOpen(true);
      router.replace(ROUTES.LEAVE.LEAVE_POLICIES, undefined, {
        shallow: true
      });
    }
  }, [router, router.isReady, router.query.action, canManagePolicies]);

  const handleSelectPolicyType = (policyType: PolicyType): void => {
    setIsPolicyTypeModalOpen(false);
    router.push({
      pathname: ROUTES.LEAVE.CREATE_LEAVE_POLICY,
      query: { type: policyType }
    });
  };

  return (
    <ContentLayout
      breadcrumbs={[
        { label: translateText(["breadcrumbLeave"]) },
        { label: translateText(["breadcrumbLeavePolicies"]) }
      ]}
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={
        canManagePolicies ? translateText(["createPolicyBtnTxt"]) : undefined
      }
      secondaryBtnText={
        canManagePolicies ? translateText(["bulkUploadBtnTxt"]) : undefined
      }
      secondaryBtnIconName={IconName.UP_ARROW_ICON}
      onPrimaryButtonClick={() => setIsPolicyTypeModalOpen(true)}
      isDividerVisible
      id={{
        primaryBtn: "create-leave-policy-btn",
        secondaryBtn: "bulk-upload-leave-policy-btn"
      }}
    >
      <>
        <LeavePoliciesTable
          onCreatePolicy={() => setIsPolicyTypeModalOpen(true)}
        />
        <PolicyTypeSelectionModal
          isOpen={isPolicyTypeModalOpen}
          onClose={() => setIsPolicyTypeModalOpen(false)}
          onSelect={handleSelectPolicyType}
        />
      </>
    </ContentLayout>
  );
};

export default LeavePolicies;
