import { AutoCompleteDropdown } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import { OptionType } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";

interface SectionItem {
  id: number;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  label?: string;
}

interface SupervisorReassignmentModalSectionProps {
  title: string;
  items: SectionItem[];
  showAvatar: boolean;
  isSearchLoading: boolean;
  assignments: Record<number, OptionType>;
  getResults: (entityId: number) => ReactNode[];
  placeholder: string;
  noResultsText: string;
  removeAriaLabel: string;
  onBlur: () => void;
  onSearch: (term: string) => void;
  onRemove: (entityId: number) => void;
}

const SupervisorReassignmentModalSection: FC<
  SupervisorReassignmentModalSectionProps
> = ({
  title,
  items,
  showAvatar,
  isSearchLoading,
  assignments,
  getResults,
  placeholder,
  noResultsText,
  removeAriaLabel,
  onBlur,
  onSearch,
  onRemove
}) => {
  return (
    <div className="flex flex-col gap-3">
      <p className="subtitle2">{title}</p>
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const assigned = assignments[item.id];

          return (
            <div
              key={item.id}
              className="flex flex-row items-center justify-between gap-3 min-h-10.25"
            >
              <div
                className={
                  showAvatar
                    ? "flex-1 min-w-0 overflow-hidden"
                    : "w-31.25 overflow-hidden shrink-0"
                }
              >
                {showAvatar ? (
                  <AvatarChip
                    firstName={item.firstName ?? ""}
                    lastName={item.lastName ?? ""}
                    avatarUrl={item.avatarUrl}
                    chipStyles={{
                      justifyContent: "flex-start",
                      color: "text.primary"
                    }}
                  />
                ) : (
                  <p className="body2 truncate">{item.label}</p>
                )}
              </div>
              <div className="w-62.5 shrink-0">
                {!assigned ? (
                  <AutoCompleteDropdown
                    hasCard={false}
                    className="w-full!"
                    onBlur={onBlur}
                    placeholder={placeholder}
                    onSearch={onSearch}
                    accessibilityTexts={{
                      noResultsFoundText: isSearchLoading
                        ? undefined
                        : noResultsText
                    }}
                    results={getResults(item.id)}
                  />
                ) : (
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-tertiary-background border border-transparent px-3 py-2.5">
                    <span className="body2 truncate flex-1">
                      {assigned.name}
                    </span>
                    <button
                      type="button"
                      aria-label={removeAriaLabel}
                      className="shrink-0 text-secondary-icon hover:text-secondary-text leading-none"
                      onClick={() => onRemove(item.id)}
                    >
                      <Icon name={IconName.CLOSE_ICON} width="16" height="16" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SupervisorReassignmentModalSection;
