import { Box, Drawer } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";

import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
import { useCrmStore } from "~community/crm/store/crmStore";
import { CrmCompanyType } from "~community/crm/types/CrmCompanyTypes";

import CompanyDetailHeader from "../../molecules/CompanyDetailHeader/CompanyDetailHeader";
import CompanyMetricCards from "../../molecules/CompanyMetricCards/CompanyMetricCards";

const getCompanyMetrics = (_company: CrmCompanyType) => [
  {
    title: "Account value",
    amount: "$104500",
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
    amount: "5"
  },
  {
    title: "Closed deals",
    amount: "5"
  }
];

const CompanyDetailDrawer: React.FC = () => {
  const theme = useTheme();
  const { isCompanyDetailDrawerOpen, selectedCompany, setIsCompanyDetailDrawerOpen, setSelectedCompany } =
    useCrmStore();

  const handleClose = () => {
    setIsCompanyDetailDrawerOpen(false);
    setSelectedCompany(null);
  };

  return (
    <Drawer
      anchor="right"
      open={isCompanyDetailDrawerOpen}
      onClose={handleClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: "calc(100vw - 507px)",
          maxWidth: "100%",
          borderRadius: "0.75rem 0 0 0.75rem",
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <Box
        sx={{
          height: "100%",
          overflowY: "auto",
          padding: "1.5rem"
        }}
      >
        {selectedCompany && (
          <CompanyDetailHeader
            company={selectedCompany}
            onClose={handleClose}
          />
        )}
        {selectedCompany && (
          <CompanyMetricCards metrics={getCompanyMetrics(selectedCompany)} />
        )}
      </Box>
    </Drawer>
  );
};

export default CompanyDetailDrawer;
