import { FilterIcon, IconButton } from "@rootcodelabs/skapp-ui";
import { ComponentProps, FC } from "react";

type IconButtonProps = ComponentProps<typeof IconButton>;

interface FilterIconButtonProps extends Omit<
  IconButtonProps,
  "icon" | "variant" | "isRounded" | "badge"
> {
  filterCount: number;
}

const FilterIconButton: FC<FilterIconButtonProps> = ({
  filterCount,
  ...rest
}) => {
  const hasFilters = filterCount > 0;

  return (
    <IconButton
      icon={
        <FilterIcon
          fill={hasFilters ? "var(--color-primary-accent)" : undefined}
        />
      }
      variant={hasFilters ? "outlined" : "default"}
      isRounded={true}
      badge={hasFilters ? { count: filterCount, show: true } : undefined}
      {...rest}
    />
  );
};

export default FilterIconButton;
