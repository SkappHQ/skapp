import { FilterIcon, IconButton } from "@rootcodelabs/skapp-ui";
import { FC, MouseEvent } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { flatListValues } from "~community/common/utils/commonUtil";
import { usePeopleStore } from "~community/people/store/store";

interface Props {
  handleFilterClick?: (event: MouseEvent<HTMLElement>) => void;
  filterId: string | undefined;
  disabled: boolean;
}

const TableFilterButton: FC<Props> = ({
  handleFilterClick,
  filterId,
  disabled
}) => {
  const translateText = useTranslator("peopleModule", "peoples");
  const { employeeDataFilter } = usePeopleStore((state) => state);

  const filterCount = flatListValues(employeeDataFilter).length;
  const hasFilters = filterCount > 0;

  if (disabled) return null;

  return (
    <div className="flex flex-row">
      <div className="flex flex-row gap-1 items-center">
        <IconButton
          icon={
            <FilterIcon
              fill={hasFilters ? "var(--color-primary-accent)" : undefined}
            />
          }
          aria-label={translateText(["filter"])}
          aria-describedby={filterId}
          onClick={handleFilterClick}
          variant={hasFilters ? "outlined" : "default"}
          isRounded={true}
          badge={hasFilters ? { count: filterCount, show: true } : undefined}
        />
      </div>
    </div>
  );
};

export default TableFilterButton;
