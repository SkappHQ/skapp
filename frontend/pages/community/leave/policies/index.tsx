import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import BulkAssignPolicyModal from "~community/leave/components/molecules/BulkAssignPolicyModals/BulkAssignPolicyModal";
import LeavePoliciesTable from "~community/leave/components/molecules/LeavePoliciesTable/LeavePoliciesTable";
import PolicyTypeSelectionModal from "~community/leave/components/molecules/PolicyTypeSelectionModal/PolicyTypeSelectionModal";
import EditLeavePolicyView from "~community/leave/components/organisms/EditLeavePolicyView/EditLeavePolicyView";
import useCanManageLeavePolicies from "~community/leave/hooks/useCanManageLeavePolicies";
import {
  LeavePolicyType,
  PolicyType
} from "~community/leave/types/LeavePolicyTypes";

const LeavePolicies: NextPage = () => {
  const translateText = useTranslator("leaveModule", "leavePolicies");

  const router = useRouter();
  const canManagePolicies = useCanManageLeavePolicies();

  const [isPolicyTypeModalOpen, setIsPolicyTypeModalOpen] =
    useState<boolean>(false);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] =
    useState<boolean>(false);
  const [isPoliciesEmpty, setIsPoliciesEmpty] = useState<boolean>(false);
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicyType | null>(
    null
  );

  const showTopActionButtons = canManagePolicies && !isPoliciesEmpty;

  const handleSelectPolicyType = (policyType: PolicyType): void => {
    setIsPolicyTypeModalOpen(false);
    router.push({
      pathname: ROUTES.LEAVE.CREATE_LEAVE_POLICY,
      query: { type: policyType }
    });
  };

  if (editingPolicy) {
    return (
      <>
        <Head>
          <title>{translateText(["editPolicy", "pageHead"])}</title>
        </Head>
        <div className="h-full p-4 sm:px-12 sm:py-6">
          <EditLeavePolicyView
            policy={editingPolicy}
            onClose={() => setEditingPolicy(null)}
          />
        </div>
      </>
    );
  }

  return (
    <ContentLayout
      breadcrumbs={[
        { label: translateText(["breadcrumbLeave"]) },
        { label: translateText(["breadcrumbLeavePolicies"]) }
      ]}
      pageHead={translateText(["pageHead"])}
      title={translateText(["title"])}
      primaryButtonText={
        showTopActionButtons ? translateText(["createPolicyBtnTxt"]) : undefined
      }
      secondaryBtnText={
        showTopActionButtons ? translateText(["bulkAssignBtnTxt"]) : undefined
      }
      secondaryBtnVariant="tertiary"
      secondaryBtnIconName={IconName.EXPORT_ARROW_ICON}
      onPrimaryButtonClick={() => setIsPolicyTypeModalOpen(true)}
      onSecondaryButtonClick={() => setIsBulkAssignModalOpen(true)}
      id={{
        primaryBtn: "create-leave-policy-btn",
        secondaryBtn: "bulk-assign-leave-policy-btn"
      }}
    >
      <>
        <LeavePoliciesTable
          onCreatePolicy={() => setIsPolicyTypeModalOpen(true)}
          onEditPolicy={setEditingPolicy}
          onEmptyStateChange={setIsPoliciesEmpty}
        />
        <PolicyTypeSelectionModal
          isOpen={isPolicyTypeModalOpen}
          onClose={() => setIsPolicyTypeModalOpen(false)}
          onSelect={handleSelectPolicyType}
        />
        <BulkAssignPolicyModal
          isOpen={isBulkAssignModalOpen}
          onClose={() => setIsBulkAssignModalOpen(false)}
        />
      </>
    </ContentLayout>
  );
};

export default LeavePolicies;
