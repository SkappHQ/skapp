import { EmptyDataView, SearchIcon } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { FC, ReactNode, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetDealById } from "~community/crm/api/DealApi";
import DeleteDealModal from "~community/crm/components/molecules/DeleteDealModal/DeleteDealModal";
import DealDetailActions from "~community/crm/components/organisms/DealSidePanel/DealDetailActions";
import DealDetailContent from "~community/crm/components/organisms/DealSidePanel/DealDetailContent";
import DealDetailIdBadge from "~community/crm/components/organisms/DealSidePanel/DealDetailIdBadge";
import { CrmErrorMessageKeyEnum } from "~community/crm/enums/common";
import { useInitializeCrmData } from "~community/crm/hooks/useInitializeCrmData";
import { useCrmStore } from "~community/crm/store/store";

import DealDetailPageSkeleton from "./DealDetailPageSkeleton";

const DealDetailPage: FC = () => {
  const translateText = useTranslator("crmModule");
  const router = useRouter();

  useInitializeCrmData();

  const isRouterReady = router.isReady;
  const dealId = Number(router.query.id);
  const isValidDealId = Number.isInteger(dealId) && dealId > 0;

  const { setSelectedDealId, dealName } = useCrmStore(
    useShallow((state) => ({
      setSelectedDealId: state.setSelectedDealId,
      dealName: state.deals[dealId]?.name
    }))
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!isRouterReady || !isValidDealId) return;

    setSelectedDealId(dealId);

    return () => setSelectedDealId(null);
  }, [isRouterReady, dealId, isValidDealId]);

  const { isError, isPending, error } = useGetDealById(
    dealId,
    isRouterReady && isValidDealId
  );

  const isViewDenied =
    error?.response?.data?.results?.[0]?.messageKey ===
    CrmErrorMessageKeyEnum.DEAL_VIEW_DENIED;

  useEffect(() => {
    if (isViewDenied) {
      router.replace(ROUTES.AUTH.UNAUTHORIZED);
    }
  }, [router, isViewDenied]);

  const getDealContent = (): ReactNode => {
    if (!isRouterReady || isViewDenied) return null;

    if (!isValidDealId || isError) {
      return (
        <EmptyDataView
          icon={<SearchIcon width="24" height="24" />}
          title={translateText(["deals", "detailsPage", "dealNotFoundTitle"])}
          description={translateText([
            "deals",
            "detailsPage",
            "dealNotFoundDescription"
          ])}
        />
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {isPending ? (
          <DealDetailPageSkeleton />
        ) : (
          <div className="flex items-start justify-between gap-4">
            <DealDetailIdBadge dealId={dealId} />
            <div className="flex items-center gap-2">
              <DealDetailActions
                dealId={dealId}
                onDeleteClick={() => setIsDeleteModalOpen(true)}
              />
            </div>
          </div>
        )}

        <DealDetailContent dealId={dealId} />
      </div>
    );
  };

  return (
    <ContentLayout
      breadcrumbs={[
        { label: translateText(["breadcrumbs", "crm"]) },
        {
          label: translateText(["deals", "page", "title"]),
          onClick: () => router.push(ROUTES.CRM.DEALS)
        }
      ]}
      pageHead={translateText(["deals", "detailsPage", "pageHead"])}
      title={translateText(["deals", "detailsPage", "title"])}
      isTitleHidden
      module={Modules.CRM}
    >
      <>
        {getDealContent()}

        {dealName && (
          <DeleteDealModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            dealName={dealName}
            onDeleted={() => router.push(ROUTES.CRM.DEALS)}
          />
        )}
      </>
    </ContentLayout>
  );
};

export default DealDetailPage;
