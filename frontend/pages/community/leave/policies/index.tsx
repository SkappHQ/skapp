import {
  Breadcrumb,
  Button,
  PlusIcon,
  UploadIcon
} from "@rootcodelabs/skapp-ui";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import ROUTES from "~community/common/constants/routes";
import { useTranslator } from "~community/common/hooks/useTranslator";
import LeavePoliciesTable from "~community/leave/components/molecules/LeavePoliciesTable/LeavePoliciesTable";

const LeavePolicies: NextPage = () => {
  const translateText = useTranslator("leaveModule", "leavePolicies");

  const router = useRouter();

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
            <h1 className="text-3xl font-bold text-gray-900">
              {translateText(["title"])}
            </h1>
            <div className="flex items-center gap-3">
              <Button
                variant="tertiary"
                size="md"
                icon={<UploadIcon />}
                iconPosition="end"
                id="bulk-upload-leave-policy-btn"
              >
                {translateText(["bulkUploadBtnTxt"])}
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={<PlusIcon />}
                iconPosition="end"
                id="create-leave-policy-btn"
                onClick={() => router.push(ROUTES.LEAVE.CREATE_LEAVE_POLICY)}
              >
                {translateText(["createPolicyBtnTxt"])}
              </Button>
            </div>
          </div>
          <hr className="border-gray-200" />
        </div>
        <LeavePoliciesTable />
      </div>
    </>
  );
};

export default LeavePolicies;
