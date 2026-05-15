import { Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AdvancedAccordion, ButtonV2 } from "@rootcodelabs/skapp-ui";
import React from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

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

  return (
    <div>
      <div className="flex flex-row justify-between w-full py-4">
        <Typography variant="h1">Deals</Typography>
        <ButtonV2
          variant="tertiary"
          icon={
            <Icon
              name={IconName.ADD_ICON}
              width="1rem"
              height="1rem"
              fill={theme.palette.text.primary}
            />
          }
        >
          Add deal
        </ButtonV2>
      </div>
      <AdvancedAccordion items={getDealItems()} allowMultiple={true} />
    </div>
  );
};

export default CompanyDeals;
