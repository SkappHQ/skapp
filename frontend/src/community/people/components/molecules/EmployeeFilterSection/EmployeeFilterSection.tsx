import { useTheme } from "@mui/material";
import { RefObject } from "react";

import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { useMediaQuery } from "~community/common/hooks/useMediaQuery";
import { IconName } from "~community/common/types/IconTypes";

const EmployeeFilterSection = ({
  selected,
  basicChipRef,
  title,
  accessibilityKey,
  data,
  currentFilter,
  handleFilterChange
}: {
  selected: string;
  basicChipRef: RefObject<{ [key: string]: HTMLDivElement | null }>;
  title: string;
  accessibilityKey: string;
  data: { label: string; value: string }[];
  currentFilter: string[];
  handleFilterChange: (
    value: string,
    accessibilityKey: string,
    currentFilter: string[]
  ) => void;
}) => {
  const theme = useTheme();

  const queryMatches = useMediaQuery();
  const isSmallScreen = queryMatches(`(max-width: 1150px)`);

  return (
    <div className="flex flex-col gap-2 mb-3">
      <p className={`font-semibold ${isSmallScreen ? "text-xs" : "text-sm"}`}>
        {title}
      </p>
      <div className="flex flex-row space-x-1 gap-2 flex-wrap">
        {data.map((item, index) => (
          <div key={index}>
            <IconChip
              ref={(el: HTMLDivElement | null) => {
                if (el && basicChipRef.current) {
                  basicChipRef.current[selected + accessibilityKey + index] =
                    el;
                }
              }}
              label={item.label}
              onClick={() =>
                handleFilterChange(item.value, accessibilityKey, currentFilter)
              }
              icon={
                currentFilter.includes(item.value) ? (
                  <Icon
                    name={IconName.SELECTED_ICON}
                    fill={theme.palette.primary.dark}
                  />
                ) : undefined
              }
              chipStyles={{
                backgroundColor: currentFilter.includes(item.value)
                  ? theme.palette.secondary.main
                  : theme.palette.grey[100],
                color: currentFilter.includes(item.value)
                  ? theme.palette.primary.dark
                  : "black",
                padding: "8px 12px",
                fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                border: currentFilter.includes(item.value)
                  ? `1px solid ${theme.palette.primary.dark}`
                  : "none"
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeFilterSection;
