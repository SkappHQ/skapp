import { FilterIcon, IconButton } from "@rootcodelabs/skapp-ui";
import { FC, KeyboardEvent, MouseEvent } from "react";

import { peopleDirectoryTestId } from "~community/common/constants/testIds";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { flatListValues } from "~community/common/utils/commonUtil";
import { usePeopleStore } from "~community/people/store/store";

interface Props {
  handleFilterClick?: (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLButtonElement>
  ) => void;
  filterId: string | undefined;
  disabled: boolean;
}

const EmployeeTableFilterButton: FC<Props> = ({
  handleFilterClick,
  filterId,
  disabled
}) => {
  const translateText = useTranslator("peopleModule", "peoples");
  const { appliedEmployeeDataFilter } = usePeopleStore((state) => state);

  const filterCount = flatListValues(appliedEmployeeDataFilter).length;
  const hasFilters = filterCount > 0;

  if (disabled) return null;

  return (
    <div className="flex flex-row">
      <div className="flex flex-row gap-1 items-center">
        <IconButton
          icon={
            <FilterIcon
              fill={hasFilters ? "var(--color-primary-text)" : undefined}
            />
          }
          aria-label={translateText(["filter"])}
          aria-describedby={filterId}
          onClick={handleFilterClick}
          variant={hasFilters ? "outlined" : "default"}
          isRounded={true}
          badge={hasFilters ? { count: filterCount, show: true } : undefined}
          data-testid={peopleDirectoryTestId.buttons.filterBtn}
        />
      </div>
    </div>
  );
};

export default EmployeeTableFilterButton;
