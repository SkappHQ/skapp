import {
  Breadcrumb,
  ButtonV2,
  PlusIcon,
  UploadIcon
} from "@rootcodelabs/skapp-ui";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { useAuth } from "~community/auth/providers/AuthProvider";
import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import LeavePoliciesTable from "~community/leave/components/molecules/LeavePoliciesTable/LeavePoliciesTable";

const LeavePolicies: NextPage = () => {
  const translateText = useTranslator("leaveModule", "leavePolicies");

  const router = useRouter();
  const { user } = useAuth();
  const isPeopleAdmin = user?.roles?.includes(AdminTypes.PEOPLE_ADMIN);

  return (
    <>
      <Head>
        <title>{translateText(["pageHead"])}</title>
      </Head>
      <div className="flex flex-col gap-6 p-4 sm:px-8 sm:py-6">
        <Breadcrumb
          items={[
            { label: translateText(["breadcrumbLeave"]) },
            { label: translateText(["breadcrumbLeavePolicies"]) }
          ]}
        />
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="h1 text-black">{translateText(["title"])}</h1>
            {isPeopleAdmin && (
              <div className="flex items-center gap-3">
                <ButtonV2
                  variant="tertiary"
                  size="md"
                  icon={<UploadIcon />}
                  iconPosition="end"
                  id="bulk-upload-leave-policy-btn"
                >
                  {translateText(["bulkUploadBtnTxt"])}
                </ButtonV2>
                <ButtonV2
                  variant="primary"
                  size="md"
                  icon={<PlusIcon />}
                  iconPosition="end"
                  id="create-leave-policy-btn"
                  onClick={() =>
                    router.push(ROUTES.LEAVE.CREATE_LEAVE_POLICY)
                  }
                >
                  {translateText(["createPolicyBtnTxt"])}
                </ButtonV2>
              </div>
            )}
          </div>
          <hr className="border-secondary-accent" />
        </div>
        <LeavePoliciesTable />
      </div>
    </>
  );
};

export default LeavePolicies;
