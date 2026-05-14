import { Skeleton } from "@mui/material";
import { ButtonV2, EmptyDataView, PlusIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetDealsByContactId } from "~community/crm/api/CrmApi";
import AdvancedAccordion from "~community/crm/components/atoms/AdvancedAccordion/AdvancedAccordion";
import type { AdvancedAccordionItem } from "~community/crm/components/atoms/AdvancedAccordion/AdvancedAccordion";
import { CrmDealStageEnum } from "~community/crm/enums/CrmDealEnums";
import { CrmDealType } from "~community/crm/types/CrmDealTypes";
import { formatDealAmount } from "~community/crm/utils/contactMetricsUtils";

import styles from "./styles";

interface Props {
  contactId: number;
}

const DealsSection: FC<Props> = ({ contactId }) => {
  const translateText = useTranslator(
    "crmModule",
    "contacts",
    "contactDetailsPanel",
    "deals"
  );

  const { data, isLoading } = useGetDealsByContactId(contactId);
  const deals: CrmDealType[] = data?.items ?? [];

  const toDealItem = (deal: CrmDealType): AdvancedAccordionItem => {
    const ownerName =
      deal.owner.firstName +
      (deal.owner.lastName ? ` ${deal.owner.lastName}` : "");

    return {
      id: String(deal.id),
      header: deal.name,
      subtitle: (
        <span className="flex items-center gap-1.5">
          <span>{ownerName}</span>
          <span className={styles.dotSeparator} />
          <span>{formatDealAmount(deal.amount)}</span>
        </span>
      ),
      statusBadge: deal.stage
        ? { text: deal.stage.name, iconColor: deal.stage.color }
        : undefined,
      content: deal.notes ? (
        <div className={styles.descriptionWrapper}>
          <p className={styles.descriptionLabel}>
            {translateText(["descriptionLabel"])}
          </p>
          <p className={styles.descriptionText}>{deal.notes}</p>
        </div>
      ) : (
        <p className={styles.contentEmpty}>
          {translateText(["noDescription"])}
        </p>
      )
    };
  };

  const dealItems: AdvancedAccordionItem[] = deals.map(toDealItem);

  return (
    <div className={styles.wrapper}>
      {/* Section header */}
      <div className={styles.header}>
        <p className={styles.title}>{translateText(["sectionHeader"])}</p>
        {/*  TODO: Wire up "Add deal" when AddDealModal is implemented */}
        <ButtonV2 type="button" variant="secondary" size="sm" disabled>
          {translateText(["addDealButton"])}
        </ButtonV2>
      </div>

      {/* Section divider */}
      <hr className={styles.divider} />

      {/* Loading skeleton */}
      {isLoading && (
        <div className={styles.skeletonList}>
          {[0, 1].map((i) => (
            <Skeleton key={i} variant="rounded" height={52} animation="wave" />
          ))}
        </div>
      )}

      {/* Deal list */}
      {!isLoading && dealItems.length > 0 && (
        <AdvancedAccordion
          items={dealItems}
          variant="card"
          className={styles.accordionList}
          ariaLabel={translateText(["sectionHeader"])}
        />
      )}

      {/* Empty state */}
      {!isLoading && dealItems.length === 0 && (
        <div className={styles.emptyWrapper}>
          <EmptyDataView
            title={translateText(["emptyTitle"])}
            description={translateText(["emptyDescription"])}
            className={{ wrapper: "!h-auto !p-0 w-full" }}
          />
          {/*   TODO: Wire up "Add deal" when AddDealModal is implemented */}
          <ButtonV2
            type="button"
            variant="line"
            size="sm"
            icon={<PlusIcon />}
            iconPosition="end"
            disabled
          >
            {translateText(["addDealButtonEmptyView"])}
          </ButtonV2>
        </div>
      )}
    </div>
  );
};

export default DealsSection;
