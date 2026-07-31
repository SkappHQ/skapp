import { ButtonV2, EmptyDataView, PlusIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useGetBusinessUnits } from "~community/common/api/BusinessUnitApi";
import { CommonModalType } from "~community/common/enums/CommonModalEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";
import { BusinessUnit } from "~community/common/types/BusinessUnitTypes";
import BusinessUnitCard from "~community/configurations/components/molecules/BusinessUnitCard/BusinessUnitCard";
import BusinessUnitCardSkeleton from "~community/configurations/components/molecules/BusinessUnitCard/BusinessUnitCardSkeleton";

const BUSINESS_UNIT_SKELETON_COUNT = 3;
const skeletonKeys = Array.from(
  { length: BUSINESS_UNIT_SKELETON_COUNT },
  (_, index) => `business-unit-skeleton-${index}`
);

const BusinessUnitsSection: FC = () => {
  const translateText = useTranslator("configurations", "businessUnit");

  const { data: businessUnits, isLoading } = useGetBusinessUnits();

  const openCommonModal = useCommonStore((state) => state.openCommonModal);

  const handleAddUnit = () => {
    openCommonModal(CommonModalType.ADD_BUSINESS_UNIT);
  };

  const handleEditUnit = (businessUnit: BusinessUnit) => {
    openCommonModal(CommonModalType.EDIT_BUSINESS_UNIT, { businessUnit });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="h2">{translateText(["title"])}</h1>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skeletonKeys.map((key) => (
            <BusinessUnitCardSkeleton key={key} />
          ))}
        </div>
      </div>
    );
  }

  if (!businessUnits) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="h2">{translateText(["title"])}</h1>
        {businessUnits.length > 0 && (
          <ButtonV2
            size="md"
            icon={<PlusIcon />}
            iconPosition="end"
            onClick={handleAddUnit}
            aria-label={translateText(["addButton"])}
          >
            {translateText(["addButton"])}
          </ButtonV2>
        )}
      </div>

      {businessUnits.length === 0 ? (
        <EmptyDataView
          title={translateText(["emptyState", "title"])}
          description={translateText(["emptyState", "description"])}
          button={{
            children: translateText(["addButton"]),
            icon: <PlusIcon />,
            iconPosition: "end",
            onClick: handleAddUnit
          }}
          className={{
            wrapper: "bg-secondary-background rounded-lg"
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {businessUnits.map((businessUnit) => (
            <BusinessUnitCard
              key={businessUnit.businessUnitId}
              businessUnit={businessUnit}
              onEdit={handleEditUnit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessUnitsSection;
