import { NextPage } from "next";
import { useRouter } from "next/router";

import { useAuth } from "~community/auth/providers/AuthProvider";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { IconName } from "~community/common/types/IconTypes";
import LeavePoliciesTable from "~community/leave/components/molecules/LeavePoliciesTable/LeavePoliciesTable";

const LeavePolicies: NextPage = () => {
  const translateText = useTranslator("leaveModule", "leavePolicies");

  const router = useRouter();
  const { user } = useAuth();
  const isPeopleAdmin = user?.roles?.includes(AdminTypes.PEOPLE_ADMIN);

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
      onPrimaryButtonClick={() =>
        router.push(ROUTES.LEAVE.CREATE_LEAVE_POLICY)
      }
      isDividerVisible
      id={{
        primaryBtn: "create-leave-policy-btn",
        secondaryBtn: "bulk-upload-leave-policy-btn"
      }}
    >
      <LeavePoliciesTable />
    </ContentLayout>
  );
};

export default LeavePolicies;
