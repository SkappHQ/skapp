import { EmptyDataView, SearchIcon } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/shallow";

import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { Modules } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetDealById } from "~community/crm/v2/api/DealApi";
import DealDetailActions from "~community/crm/v2/components/organisms/DealSidePanelV2/DealDetailActions";
import DealDetailContent from "~community/crm/v2/components/organisms/DealSidePanelV2/DealDetailContent";
import DealDetailIdBadge from "~community/crm/v2/components/organisms/DealSidePanelV2/DealDetailIdBadge";
import { useInitializeCrmData } from "~community/crm/v2/hooks/useInitializeCrmData";
import { useCrmStoreV2 } from "~community/crm/v2/store/store";

const DealDetailPage: FC = () => {
  const translateText = useTranslator("crmModule");
  const router = useRouter();

  useInitializeCrmData();

  const dealId = Number(router.query.id);
  const isValidDealId = Number.isInteger(dealId) && dealId > 0;

  const { setSelectedDealId, isCrmDataInitialized } = useCrmStoreV2(
    useShallow((state) => ({
      setSelectedDealId: state.setSelectedDealId,
      isCrmDataInitialized: state.isCrmDataInitialized
    }))
  );

  useEffect(() => {
    if (!isValidDealId) return;

    setSelectedDealId(dealId);

    return () => setSelectedDealId(null);
  }, [dealId, isValidDealId]);

  const { isError } = useGetDealById(
    dealId,
    isValidDealId && isCrmDataInitialized
  );

  return (
    <ContentLayout
      breadcrumbs={[
        { label: translateText(["breadcrumbs", "crm"]) },
        { label: translateText(["deals", "title"]) }
      ]}
      pageHead={translateText(["deals", "detailsPageHead"])}
      title={translateText(["deals", "detailsTitle"])}
      isTitleHidden
      module={Modules.CRM}
    >
      {!isValidDealId || isError ? (
        <EmptyDataView
          icon={<SearchIcon width="24" height="24" />}
          title={translateText([
            "deals",
            "sidePanel",
            "errors",
            "dealNotFoundTitle"
          ])}
          description={translateText([
            "deals",
            "sidePanel",
            "errors",
            "dealNotFoundDescription"
          ])}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <DealDetailIdBadge dealId={dealId} />
            <div className="flex items-center gap-2">
              <DealDetailActions
                dealId={dealId}
                onDeleted={() => router.push(ROUTES.CRM.DEALS)}
              />
            </div>
          </div>
          <DealDetailContent dealId={dealId} />
        </div>
      )}
    </ContentLayout>
  );
};

export default DealDetailPage;
