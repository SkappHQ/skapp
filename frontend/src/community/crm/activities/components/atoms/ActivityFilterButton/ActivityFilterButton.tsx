import { FilterIcon, IconButton } from "@rootcodelabs/skapp-ui";
import { ComponentProps, FC } from "react";

type IconButtonProps = ComponentProps<typeof IconButton>;

interface ActivityFilterButtonProps extends Omit<
  IconButtonProps,
  "icon" | "variant" | "shape" | "isRounded" | "badge"
> {
  filterCount: number;
}

const ActivityFilterButton: FC<ActivityFilterButtonProps> = ({
  filterCount,
  ...rest
}) => {
  const hasFilters = filterCount > 0;

  return (
    <IconButton
      icon={
        <FilterIcon
          fill={hasFilters ? "var(--color-primary-accent)" : "currentColor"}
        />
      }
      variant="outlined"
      shape="square"
      badge={hasFilters ? { count: filterCount, show: true } : { count: 0 }}
      {...rest}
    />
  );
};

export default ActivityFilterButton;
