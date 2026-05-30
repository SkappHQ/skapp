import { FC } from "react";

import { KebabMenu, SidePanel } from "@rootcodelabs/skapp-ui";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCrmStore } from "~community/crm/store/store";

import CompanyViewSidePanelSkeleton from "../../molecules/CompanyViewSidePanelSkeleton/CompanyViewSidePanelSkeleton";

const CompanyViewSidePanel: FC = () => {
  const translateText = useTranslator("crmModule", "companies", "sidePanel");

  const {
    isCompanySidePanelOpen,
    selectedCompanyId,
    setIsCompanySidePanelOpen,
    setSelectedCompanyId
  } = useCrmStore((store) => ({
    isCompanySidePanelOpen: store.isCompanySidePanelOpen,
    selectedCompanyId: store.selectedCompanyId,
    setIsCompanySidePanelOpen: store.setIsCompanySidePanelOpen,
    setSelectedCompanyId: store.setSelectedCompanyId
  }));

  const isLoading = false;



  const handleClose = () => {
    setIsCompanySidePanelOpen(false);
    setSelectedCompanyId(null);
  };

  const kebabMenuItems = [
    {
      id: "delete",
      label: translateText(["kebabMenu", "delete"]),
      onClick: () => {
        // TODO: handle delete
      }
    }
  ];

  return (
    <SidePanel
      isOpen={isCompanySidePanelOpen}
      onClose={handleClose}
      width="lg"
      closeAriaLabel={translateText(["ariaLabels", "closePanel"])}
      headerActions={
        <KebabMenu
          id="company-side-panel-kebab"
          menuItems={kebabMenuItems}
          position="bottom-left"
          className={{
            anchorElement:
              "!h-9 !w-9 bg-tertiary-background hover:!bg-secondary-accent rounded-full [&>svg]:w-4 [&>svg]:h-4"
          }}
        />
      }
    >
      {isLoading ? (
        <CompanyViewSidePanelSkeleton />
      ) : (
        <div className="flex flex-col gap-6 p-6">
          {/* TODO: SidePanelCompanyHeader */}
          {/* TODO: SidePanelMetricCards */}
          {/* TODO: SidePanelDeals */}
          {/* TODO: SidePanelContacts */}
        </div>
      )}
    </SidePanel>
  );
};

export default CompanyViewSidePanel;
