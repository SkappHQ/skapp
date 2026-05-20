import { SidePanel } from "@rootcodelabs/skapp-ui";
import React from "react";
import { createPortal } from "react-dom";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
import AddDealForm from "~community/crm/components/molecules/AddDealForm/AddDealForm";
import { useCrmStore } from "~community/crm/store/store";
import { CrmCompanyMetricsType } from "~community/crm/types/CommonTypes";

import CompanyContacts from "../../molecules/CompanyContacts/CompanyContacts";
import CompanyDeals from "../../molecules/CompanyDeals/CompanyDeals";
import CompanyDetailHeader, {
  CompanyDetailHeaderActions
} from "../../molecules/CompanyDetailHeader/CompanyDetailHeader";
import CompanyMetricCards from "../../molecules/CompanyMetricCards/CompanyMetricCards";
import TasksSection from "../../molecules/TaskSection/TasksSection";

const getCompanyMetrics = (company: CrmCompanyMetricsType) => [
  {
    title: "Account value",
    amount: company.accountValue ?? 0,
    chip: {
      label: "+$8.2k last 30 days",
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

const getCompanyContacts = (company: CrmCompanyMetricsType) => [
  // TODO: Wire up contacts for the selected company
  {
    id: "1",
    name: "Samuel West",
    email: "samuelwest@mail.com",
    contactNo: "+94 439348842",
    company: "Acme",
    revenue: "$62000",
    dealsClosed: 4,
    openTasks: 2,
    overdueTasks: 1
  },
  {
    id: "2",
    name: "Hannah Lee",
    email: "hannah.lee@stark.com",
    contactNo: "+1 2129876543",
    company: "Stark Industries",
    revenue: "$80000",
    dealsClosed: 8,
    openTasks: 9,
    overdueTasks: 0
  },
  {
    id: "3",
    name: "Linda Martinez",
    email: "linda.martinez@globex.com",
    contactNo: "+44 2071234567",
    company: "Globex Corp",
    revenue: "$75000",
    dealsClosed: 6,
    openTasks: 11,
    overdueTasks: 0
  },
  {
    id: "4",
    name: "Michael Brown",
    email: "michael.brown@initech.com",
    contactNo: "+1 4159876543",
    company: "Initech",
    revenue: "$90000",
    dealsClosed: 10,
    openTasks: 5,
    overdueTasks: 2
  },
  {
    id: "5",
    name: "Emily Davis",
    email: "emily.davis@initech.com",
    contactNo: "+1 4159876544",
    company: "Initech",
    revenue: "$95000",
    dealsClosed: 12,
    openTasks: 6,
    overdueTasks: 3
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
  const { isAddDealFormOpen, setIsAddDealFormOpen } = useCrmStore();
  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        pointerEvents: "none"
      }}
    >
      <div
        className="[&_aside]:!min-w-[68vw] [&_aside]:!max-w-[62.813rem]"
        style={{ pointerEvents: "auto" }}
      >
        <SidePanel
          isOpen={isOpen}
          header={
            isAddDealFormOpen ? (
              <div className="w-full p-[0.5rem]">
                <p className="font-bold text-2xl leading-6 tracking-[0.07px]">Add deal</p>
              </div>
            ) : (
              <div className="w-full p-[0.5rem]">
                {selectedCompany && (
                  <CompanyDetailHeader company={selectedCompany} />
                )}
              </div>
            )
          }
          headerActions={!isAddDealFormOpen && selectedCompany && <CompanyDetailHeaderActions company={selectedCompany} />}
          width="lg"
          onClose={isAddDealFormOpen ? () => setIsAddDealFormOpen(false) : onClose}
        >
          <div className="flex flex-col w-full">
            {isAddDealFormOpen ? (
              <AddDealForm />
            ) : (
              <>
                {selectedCompany && (
                  <CompanyMetricCards
                    metrics={getCompanyMetrics(selectedCompany)}
                  />
                )}
                {selectedCompany && <CompanyDeals />}
                {selectedCompany && (
                  <CompanyContacts contacts={getCompanyContacts(selectedCompany)} />
                )}
                {selectedCompany && (
                  <div className="pt-6 pb-4">
                    <TasksSection companyId={selectedCompany.id} />
                  </div>
                )}
              </>
            )}
          </div>
        </SidePanel>
      </div>
    </div>,
    document.body
  );
};

export default CompanyViewSidePanel;
