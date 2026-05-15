import { Drawer } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";

import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
import { useCrmStore } from "~community/crm/store/store";
import {
  CrmCompanyTableDataType,
  CrmCompanyType
} from "~community/crm/types/CommonTypes";

import CompanyContactsTables from "../../molecules/CompanyContactsTable/CompanyContactsTables";
import CompanyDeals from "../../molecules/CompanyDeals/CompanyDeals";
import CompanyDetailHeader from "../../molecules/CompanyDetailHeader/CompanyDetailHeader";
import CompanyMetricCards from "../../molecules/CompanyMetricCards/CompanyMetricCards";
import TasksSection from "../../molecules/TasksSection/TasksSection";

const getCompanyMetrics = (company: CrmCompanyTableDataType) => [
  {
    title: "Account value",
    amount: `$${company.accountValue ?? "0"}`,
    chip: (
      <IconChip
        icon={
          <Icon
            name={IconName.UP_ARROW_ICON}
            width="12"
            height="12"
            fill="#166534"
          />
        }
        label="+$8.2k last 30 days"
        isTruncated={false}
        chipStyles={{
          backgroundColor: "#ECFCCB",
          color: "#166534",
          fontSize: "0.75rem",
          fontWeight: 500,
          py: "0.25rem",
          px: "0.5rem"
        }}
      />
    )
  },
  {
    title: "Open deals",
    amount: String(company.openDeals ?? 0)
  },
  {
    title: "Closed deals",
    amount: String(company.closedDeals ?? 0)
  }
];

const CompanyDetailDrawer: React.FC = () => {
  const theme = useTheme();
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
    <Drawer
      anchor="right"
      open={isCompanyDetailDrawerOpen}
      onClose={handleClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: "min(70vw, 65rem)",
          minWidth: "34rem",
          maxWidth: "100vw",
          borderRadius: 0,
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <div className="flex flex-col gap-1 w-full p-6">
        <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-4">
          {selectedCompany && (
            <CompanyDetailHeader
              company={selectedCompany}
              onClose={handleClose}
            />
          )}
          {selectedCompany && (
            <CompanyMetricCards metrics={getCompanyMetrics(selectedCompany)} />
          )}
        </div>
        <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-4 overflow-auto">
          <CompanyDeals />
        </div>
        <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-4">
          <CompanyContactsTables />
        </div>
        <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-4">
          <TasksSection />
        </div>
      </div>
    </Drawer>
  );
};

export default CompanyDetailDrawer;
