import { EmptyDataView, SearchIcon } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetDealById } from "~community/crm/v2/api/DealApi";
import DeleteDealModalV2 from "~community/crm/v2/components/molecules/DeleteDealModalV2/DeleteDealModalV2";
import DealDetailActions from "~community/crm/v2/components/organisms/DealSidePanelV2/DealDetailActions";
import DealDetailContent from "~community/crm/v2/components/organisms/DealSidePanelV2/DealDetailContent";
import DealDetailIdBadge from "~community/crm/v2/components/organisms/DealSidePanelV2/DealDetailIdBadge";
import { CrmErrorMessageKeyEnum } from "~community/crm/v2/enums/common";
import { useInitializeCrmData } from "~community/crm/v2/hooks/useInitializeCrmData";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";

const DealDetailPage: FC = () => {
  const translateText = useTranslator("crmModuleV2");
  const router = useRouter();

  useInitializeCrmData();

  const isRouterReady = router.isReady;
  const dealId = Number(router.query.id);
  const isValidDealId = Number.isInteger(dealId) && dealId > 0;

  const { setSelectedDealId, isCrmDataInitialized, dealName } = useCrmStoreV2(
    useShallow((state) => ({
      setSelectedDealId: state.setSelectedDealId,
      isCrmDataInitialized: state.isCrmDataInitialized,
      dealName: state.deals[dealId]?.name
    }))
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!isRouterReady || !isValidDealId) return;

    setSelectedDealId(dealId);

    return () => setSelectedDealId(null);
  }, [isRouterReady, dealId, isValidDealId]);

  const { isError, error } = useGetDealById(
    dealId,
    isRouterReady && isValidDealId && isCrmDataInitialized
  );

  const isViewDenied =
    error?.response?.data?.results?.[0]?.messageKey ===
    CrmErrorMessageKeyEnum.DEAL_VIEW_DENIED;

  useEffect(() => {
    if (isViewDenied) {
      router.replace(ROUTES.AUTH.UNAUTHORIZED);
    }
  }, [router, isViewDenied]);

  const isDealReadable = isRouterReady && !isViewDenied;
  const isDealUnavailable = isDealReadable && (!isValidDealId || isError);
  const isDealVisible = isDealReadable && isValidDealId && !isError;

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
        {isDealUnavailable && (
          <EmptyDataView
            icon={<SearchIcon width="24" height="24" />}
            title={translateText(["deals", "detailsPage", "dealNotFoundTitle"])}
            description={translateText([
              "deals",
              "detailsPage",
              "dealNotFoundDescription"
            ])}
          />
        )}
        {isDealVisible && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <DealDetailIdBadge dealId={dealId} />
              <div className="flex items-center gap-2">
                <DealDetailActions
                  dealId={dealId}
                  onDeleteClick={() => setIsDeleteModalOpen(true)}
                />
              </div>
            </div>
            <DealDetailContent dealId={dealId} />
          </div>
        )}

        {dealName && (
          <DeleteDealModalV2
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
