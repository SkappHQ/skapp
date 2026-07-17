import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { IconName } from "~community/common/types/IconTypes";
import LeavePoliciesTable from "~community/leave/components/molecules/LeavePoliciesTable/LeavePoliciesTable";
import PolicyTypeSelectionModal from "~community/leave/components/molecules/PolicyTypeSelectionModal/PolicyTypeSelectionModal";
import { PolicyType } from "~community/leave/types/LeavePolicyTypes";

const POLICY_TYPE_SELECT_QUERY = "select-policy-type";

const LeavePolicies: NextPage = () => {
  const translateText = useTranslator("leaveModule", "leavePolicies");

  const router = useRouter();
  const { user } = useAuth();
  const isPeopleAdmin = user?.roles?.includes(AdminTypes.PEOPLE_ADMIN);

  const [isPolicyTypeModalOpen, setIsPolicyTypeModalOpen] =
    useState<boolean>(false);

  useEffect(() => {
    if (
      router.isReady &&
      router.query.action === POLICY_TYPE_SELECT_QUERY &&
      isPeopleAdmin
    ) {
      setIsPolicyTypeModalOpen(true);
      router.replace(ROUTES.LEAVE.LEAVE_POLICIES, undefined, {
        shallow: true
      });
    }
  }, [router, router.isReady, router.query.action, isPeopleAdmin]);

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
        isPeopleAdmin ? translateText(["createPolicyBtnTxt"]) : undefined
      }
      secondaryBtnText={
        isPeopleAdmin ? translateText(["bulkUploadBtnTxt"]) : undefined
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
