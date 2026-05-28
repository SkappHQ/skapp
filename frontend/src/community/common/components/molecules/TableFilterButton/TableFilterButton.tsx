import { FC, MouseEvent } from "react";

import FilterIconButton from "~community/common/components/atoms/FilterIconButton/FilterIconButton";
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

  if (disabled) return null;

  return (
    <div className="flex flex-row">
      <div className="flex flex-row gap-1 items-center">
        <FilterIconButton
          filterCount={filterCount}
          aria-label={translateText(["filter"])}
          aria-describedby={filterId}
          onClick={handleFilterClick}
        />
      </div>
    </div>
  );
};

export default TableFilterButton;
