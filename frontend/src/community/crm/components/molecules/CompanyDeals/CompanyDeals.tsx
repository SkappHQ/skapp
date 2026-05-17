import { Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";

import { AdvancedAccordion } from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";
import { useCrmStore } from "~community/crm/store/store";

import styles from "./styles";

const getDealItems = () => [
  {
    id: "deal-1",
    header: "Warehouse machinery supply",
    subtitle: (
      <>
        <span>Samuel West</span>
        <span className="inline-block h-1 w-1 rounded-full bg-gray-400" />
        <span>$12000</span>
      </>
    ),
    statusBadge: {
      text: "Lead Qualified",
      iconColor: "#3b82f6"
    },
    content: (
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-gray-500">Description</p>
        <p className="text-xs text-black">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa
          mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla,
          mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis
          tellus. Nullam quis imperdiet augue.
        </p>
      </div>
    )
  },
  {
    id: "deal-2",
    header: "Warehouse machinery supply",
    subtitle: (
      <>
        <span>Samuel West</span>
        <span className="inline-block h-1 w-1 rounded-full bg-gray-400" />
        <span>$12000</span>
      </>
    ),
    statusBadge: {
      text: "Lead Qualified",
      iconColor: "#3b82f6"
    },
    content: (
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-gray-500">Description</p>
        <p className="text-xs text-black">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>
    )
  },
  {
    id: "deal-3",
    header: "Warehouse machinery supply",
    subtitle: (
      <>
        <span>Samuel West</span>
        <span className="inline-block h-1 w-1 rounded-full bg-gray-400" />
        <span>$12000</span>
      </>
    ),
    statusBadge: {
      text: "Proposal Sent",
      iconColor: "#34d399"
    },
    content: (
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-gray-500">Description</p>
        <p className="text-xs text-black">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>
    )
  }
];

const CompanyDeals: React.FC = () => {
  const theme = useTheme();
  const classes = styles(theme);
  const { setIsAddDealFormOpen } = useCrmStore();

  const handleAddDeal = () => {
    setIsAddDealFormOpen(true);
  };

  return (
    <Box sx={classes.wrapper}>
      <Box sx={classes.header}>
        <Typography sx={classes.title}>Deals</Typography>
        <Button variant="outlined" sx={classes.addButton} onClick={handleAddDeal}>
          Add deal
          <Icon
            name={IconName.ADD_ICON}
            width="1rem"
            height="1rem"
            fill={theme.palette.text.primary}
          />
        </Button>
      </Box>
      <Box sx={classes.divider} />
      <AdvancedAccordion
        items={getDealItems()}
        variant="card"
        allowMultiple={true}
      />
    </Box>
  );
};

export default CompanyDeals;
