import { SidePanel } from "@rootcodelabs/skapp-ui";
import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
import { useCrmStore } from "~community/crm/store/store";
import { CrmCompanyMetricsType } from "~community/crm/types/CommonTypes";

import CompanyContacts from "../../molecules/CompanyContacts/CompanyContacts";
import CompanyDeals from "../../molecules/CompanyDeals/CompanyDeals";
import CompanyDetailHeader, {
  CompanyDetailHeaderActions
} from "../../molecules/CompanyDetailHeader/CompanyDetailHeader";
import CompanyMetricCards from "../../molecules/CompanyMetricCards/CompanyMetricCards";

const getCompanyMetrics = (company: CrmCompanyMetricsType) => [
  {
    title: "Account value",
    amount: `$${company.accountValue ?? "0"}`,
    chip: {
      label: "test",
      color: "#166534",
      bgColor: "#ECFCCB",
      icon: (
        <Icon
          name={IconName.UP_ARROW_ICON}
          width="12"
          height="12"
          fill="#166534"
        />
      )
    }
  },
  {
    title: "Open deals",
    amount: String(company.openDeals ?? 0),
    chip: undefined
  },
  {
    title: "Closed deals",
    amount: String(company.closedDeals ?? 0),
    chip: undefined
  }
];

const CompanyDetailDrawer: React.FC = () => {
  const {
    isCompanyDetailDrawerOpen,
    setIsCompanyDetailDrawerOpen,
    selectedCompany
  } = useCrmStore((store) => ({
    isCompanyDetailDrawerOpen: store.isCompanyDetailDrawerOpen,
    setIsCompanyDetailDrawerOpen: store.setIsCompanyDetailDrawerOpen,
    selectedCompany: store.selectedCompany
  }));

  const handleClose = () => {
    setIsCompanyDetailDrawerOpen(false);
  };

  return (
    <div className="crm-panel">
      <SidePanel
        isOpen={isCompanyDetailDrawerOpen}
        header={
          <div className="w-full p-[0.5rem]">
            {selectedCompany && (
              <CompanyDetailHeader company={selectedCompany} />
            )}
          </div>
        }
        headerActions={<CompanyDetailHeaderActions />}
        width="xl"
        onClose={handleClose}
      >
        <div className="flex flex-col w-full p-[0.5rem]">
          {selectedCompany && (
            <CompanyMetricCards metrics={getCompanyMetrics(selectedCompany)} />
          )}
          <CompanyDeals />
          <CompanyContacts contacts={[]} />
        </div>
      </SidePanel>
    </div>
  );
};

export default CompanyDetailDrawer;
