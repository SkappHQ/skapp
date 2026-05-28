import { SidePanel } from "@rootcodelabs/skapp-ui";
import React from "react";
import { createPortal } from "react-dom";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
import AddDealForm from "~community/crm/components/molecules/AddDealForm/AddDealForm";
import { useCrmStore } from "~community/crm/store/store";
import { CrmCompanyMetricsType, CrmDealType } from "~community/crm/types/CommonTypes";
import { CrmSidePanelContactRow } from "~community/crm/types/CrmContactTypes";

import SidePanelDeals from "../../molecules/SidePanelDeals/SidePanelDeals";
import CompanyDetailHeader, {
  CompanyDetailHeaderActions
} from "../../molecules/CompanyDetailHeader/CompanyDetailHeader";
import CompanyMetricCards from "../../molecules/CompanyMetricCards/CompanyMetricCards";
import SidePanelCompanyContacts from "../../molecules/SidePanelCompanyContacts/SidePanelCompanyContacts";
import TasksSection from "../../molecules/TasksSection/TasksSection";

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

const getCompanyContacts = (company: CrmCompanyMetricsType): CrmSidePanelContactRow[] => [
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

// TODO: Replace with API data
const getCompanyDeals = (): CrmDealType[] => [
  {
    id: 1,
    name: "Warehouse machinery supply",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris.",
    stage: { id: 1, name: "Lead Qualified", color: "#3b82f6", orderIndex: 0, stageType: "OPEN" as any },
    priority: null,
    closingAt: null,
    amount: "12000",
    currencyCode: "$",
    company: null,
    contact: { id: 1, name: "Samuel West", email: "samuelwest@mail.com", contactNumber: null, lastContactAt: null, lastModifiedDate: "", company: null, owner: { employeeId: 1, firstName: "John", lastName: "Doe", authPic: null }, isDeleted: false },
    owner: { employeeId: 1, firstName: "John", lastName: "Doe", authPic: null },
    isDeleted: false
  },
  {
    id: 2,
    name: "Office supplies contract",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    stage: { id: 2, name: "Proposal Sent", color: "#34d399", orderIndex: 1, stageType: "OPEN" as any },
    priority: null,
    closingAt: null,
    amount: "8500",
    currencyCode: "$",
    company: null,
    contact: { id: 2, name: "Hannah Lee", email: "hannah.lee@stark.com", contactNumber: null, lastContactAt: null, lastModifiedDate: "", company: null, owner: { employeeId: 1, firstName: "John", lastName: "Doe", authPic: null }, isDeleted: false },
    owner: { employeeId: 1, firstName: "John", lastName: "Doe", authPic: null },
    isDeleted: false
  },
  {
    id: 3,
    name: "Annual maintenance deal",
    stage: { id: 1, name: "Lead Qualified", color: "#3b82f6", orderIndex: 0, stageType: "OPEN" as any },
    priority: null,
    closingAt: null,
    amount: "15000",
    currencyCode: "$",
    company: null,
    contact: { id: 1, name: "Samuel West", email: "samuelwest@mail.com", contactNumber: null, lastContactAt: null, lastModifiedDate: "", company: null, owner: { employeeId: 1, firstName: "John", lastName: "Doe", authPic: null }, isDeleted: false },
    owner: { employeeId: 1, firstName: "John", lastName: "Doe", authPic: null },
    isDeleted: false
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
                {selectedCompany && <SidePanelDeals deals={getCompanyDeals()} />}
                {selectedCompany && (
                  <SidePanelCompanyContacts contacts={getCompanyContacts(selectedCompany)} />
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
