import { Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ButtonV2, EmptyDataView } from "@rootcodelabs/skapp-ui";
import React from "react";

import AddIcon from "~community/common/assets/Icons/AddIcon";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { IconName } from "~community/common/types/IconTypes";

import AdvancedAccordion from "../../atoms/AdvancedAccordion/AdvancedAccordion";
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

  return (
    <div>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <p className={styles.title}>{"Deals"}</p>
          {/*  TODO: Wire up "Add deal" when AddDealModal is implemented */}
          <ButtonV2 type="button" variant="secondary" size="sm" disabled>
            {"Add Deal"}
          </ButtonV2>
        </div>
        <AdvancedAccordion
          items={getDealItems()}
          variant="card"
          className={styles.accordionList}
        />
      </div>
    </div>
  );
};

export default CompanyDeals;
