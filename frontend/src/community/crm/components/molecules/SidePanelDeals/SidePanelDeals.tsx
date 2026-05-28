import React from "react";

import {
  AdvancedAccordion,
  AdvancedAccordionItem,
  ButtonV2,
  EmptyDataView,
  SearchIcon
} from "@rootcodelabs/skapp-ui";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { CrmDealType } from "~community/crm/types/CommonTypes";
import { formatDealAmountWithCurrency } from "~community/crm/utils/dealHelpers";

import styles from "./styles"

const mapDealsToAccordionItems = (
  deals: CrmDealType[],
  descriptionLabel: string
): AdvancedAccordionItem[] =>
  deals.map((deal) => ({
    id: String(deal.id),
    header: (
      <div className={styles.dealHeader}>
        <span className={styles.dealName}>{deal.name}</span>
        <div className={styles.dealMeta}>
          <span className="body3">{deal.contact.name}</span>
          {deal.amount && (
            <>
              <span className={styles.dealSeparator} />
              <span className="body3">
                {formatDealAmountWithCurrency(deal.amount, deal.currencyCode)}
              </span>
            </>
          )}
        </div>
      </div>
    ),
    badge: (
      <div className={styles.badgeWrapper}>
        <span
          className={styles.badgeDot}
          style={{ backgroundColor: deal.stage.color }}
        />
        <span className={styles.badgeText}>{deal.stage.name}</span>
      </div>
    ),
    content: (
      <div className={styles.contentWrapper}>
        <p className={styles.contentLabel}>{descriptionLabel}</p>
        {deal.description ? (
          <p className={styles.contentText}>{deal.description}</p>
        ) : (
          <Icon name={IconName.DASH_ICON} width="16" height="16" />
        )}
      </div>
    )
  }));

interface Props {
  deals: CrmDealType[];
  isLoading?: boolean;
}

const SidePanelDeals: React.FC<Props> = ({ deals, isLoading }) => {
  const translateText = useTranslator("crmModule", "deals", "sidePanel");

  const handleAddDeal = () => {
    // TODO: Open the add deal side panel when clicked
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{translateText(["title"])}</h2>
      <hr className={styles.divider} />
      {isLoading ? (
        <div className={styles.skeletonList}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={styles.skeletonItem}
            />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <EmptyDataView
          icon={<SearchIcon width="24" height="24" />}
          title={translateText(["emptyTitle"])}
          description={translateText(["emptyDescription"])}
          button={{
            text: translateText(["addDealBtn"]),
            variant: "tertiary",
            onClick: handleAddDeal,
            "aria-label": translateText(["ariaLabels", "addDealBtn"])
          }}
          className={{
            wrapper: styles.emptyWrapper
          }}
        />
      ) : (
        <div className={styles.dealsList}>
          <AdvancedAccordion
            items={mapDealsToAccordionItems(
              deals,
              translateText(["descriptionLabel"])
            )}
            allowMultiple={true}
            className={styles.accordionWrapper}
          />
          <ButtonV2
            variant="line"
            size="sm"
            onClick={handleAddDeal}
            className={styles.addDealBtn}
            aria-label={translateText(["ariaLabels", "addDealBtn"])}
            icon={
              <Icon
                name={IconName.ADD_ICON}
                width="1rem"
                height="1rem"
                fill="currentColor"
              />
            }
            iconPosition="end"
          >
            {translateText(["addDealBtn"])}
          </ButtonV2>
        </div>
      )}
    </div>
  );
};

export default SidePanelDeals;
