import { ButtonV2, EmptyDataView, PlusIcon } from "@rootcodelabs/skapp-ui";
import { FC } from "react";

import { useGetBusinessUnits } from "~community/common/api/BusinessUnitApi";
import { CommonModalType } from "~community/common/enums/CommonModalEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useCommonStore } from "~community/common/stores/commonStore";
import { BusinessUnit } from "~community/common/types/BusinessUnitTypes";
import BusinessUnitCard from "~community/configurations/components/molecules/BusinessUnitCard/BusinessUnitCard";
import BusinessUnitCardSkeleton from "~community/configurations/components/molecules/BusinessUnitCard/BusinessUnitCardSkeleton";

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

  const handleDeleteUnit = (businessUnit: BusinessUnit) => {
    openCommonModal(CommonModalType.DELETE_BUSINESS_UNIT, { businessUnit });
  };

  const renderBody = () => {
    if (isLoading) {
      return <BusinessUnitCardSkeleton />;
    }

    if (!businessUnits) {
      return null;
    }

    if (businessUnits.length === 0) {
      return (
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
      );
    }

    return (
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {businessUnits.map((businessUnit) => (
          <li key={businessUnit.businessUnitId} className="mb-0">
            <BusinessUnitCard
              businessUnit={businessUnit}
              onEdit={handleEditUnit}
              onDelete={handleDeleteUnit}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="h2">{translateText(["title"])}</h2>
        {!isLoading && businessUnits && businessUnits.length > 0 && (
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

      {renderBody()}
    </div>
  );
};

export default BusinessUnitsSection;
