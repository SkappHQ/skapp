import { FC, KeyboardEvent, MouseEvent } from "react";

import FilterIconButton from "~community/common/components/atoms/FilterIconButton/FilterIconButton";
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

  if (disabled) return null;

  return (
    <div className="flex flex-row">
      <div className="flex flex-row gap-1 items-center">
        <FilterIconButton
          filterCount={filterCount}
          aria-label={translateText(["filter"])}
          aria-describedby={filterId}
          onClick={handleFilterClick}
          data-testid={peopleDirectoryTestId.buttons.filterBtn}
        />
      </div>
    </div>
  );
};

export default EmployeeTableFilterButton;
