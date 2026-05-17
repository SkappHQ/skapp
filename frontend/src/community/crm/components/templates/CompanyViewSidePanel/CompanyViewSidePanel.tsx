import { SidePanel } from "@rootcodelabs/skapp-ui";
import React from "react";
import { createPortal } from "react-dom";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
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

interface CompanyViewSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCompany: CrmCompanyMetricsType | null;
}

const CompanyViewSidePanel: React.FC<CompanyViewSidePanelProps> = ({
  isOpen,
  onClose,
  selectedCompany
}) => {
  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1500,
        pointerEvents: "none"
      }}
    >
      <div
        className="[&_aside]:!w-[62.8125rem]"
        style={{ pointerEvents: "auto" }}
      >
        <SidePanel
          isOpen={isOpen}
          header={
            <div className="w-full p-[0.5rem]">
              {selectedCompany && (
                <CompanyDetailHeader company={selectedCompany} />
              )}
            </div>
          }
          headerActions={<CompanyDetailHeaderActions />}
          width="lg"
          onClose={onClose}
        >
          <div className="flex flex-col w-full p-[0.5rem]">
            {selectedCompany && (
              <CompanyMetricCards
                metrics={getCompanyMetrics(selectedCompany)}
              />
            )}
            <CompanyDeals />
            <CompanyContacts contacts={[]} />
          </div>
        </SidePanel>
      </div>
    </div>,
    document.body
  );
};

export default CompanyViewSidePanel;
