import { AvatarChip } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, ReactNode, useEffect, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { OptionType } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/people/components/molecules/SearchableDropdown/SearchableDropdown";
import {
  AllEmployeeDataType,
  EmployeeDataTeamType
} from "~community/people/types/PeopleTypes";
import { concatStrings } from "~community/people/utils/jobFamilyUtils/commonUtils";

const EmployeeAvatarChip: FC<{ employee: AllEmployeeDataType }> = ({
  employee
}) => {
  const imageUrl = useGetImageUrl(employee.authPic ?? "");

  return (
    <AvatarChip
      avatarProps={{
        id: String(employee.employeeId),
        firstName: employee.firstName,
        lastName: employee.lastName,
        src: imageUrl ?? "",
        size: "sm"
      }}
      label={concatStrings([employee.firstName, employee.lastName]).trim()}
    />
  );
};

type SectionItem = AllEmployeeDataType | EmployeeDataTeamType;

interface SupervisorReassignmentModalSectionProps {
  title: string;
  items: SectionItem[];
  showAvatar: boolean;
  isTeamSection: boolean;
  isSearchLoading: boolean;
  assignments: Record<number, OptionType>;
  getItems: (entityId: number) => SearchableDropdownItem[];
  onSelectItem: (entityId: number, item: SearchableDropdownItem) => void;
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
  isTeamSection,
  isSearchLoading,
  assignments,
  getItems,
  onSelectItem,
  onBlur,
  onSearch,
  onRemove
}) => {
  const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
  const [isTyping, setIsTyping] = useState<Record<number, boolean>>({});
  const translateText = useTranslator("peopleModule", "supervisorReassignment");
  const removeButtonAriaLabel = translateText(["removeAssignment"]);
  const placeholderText = translateText(["selectSupervisorPlaceholder"]);

  useEffect(() => {
    if (!isSearchLoading) {
      setIsTyping({});
    }
  }, [isSearchLoading]);

  const handleInputChange = (
    entityId: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const term = e.target.value;
    setSearchTerms((prev) => ({ ...prev, [entityId]: term }));
    if (term.trim().length > 0) {
      setIsTyping((prev) => ({ ...prev, [entityId]: true }));
    } else {
      setIsTyping((prev) => ({ ...prev, [entityId]: false }));
    }
    onSearch(term);
  };

  const handleBlur = (entityId: number) => {
    setSearchTerms((prev) => ({ ...prev, [entityId]: "" }));
    onBlur();
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="subtitle2">{title}</p>
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          let id: number;
          let nameRow: ReactNode;

          if (isTeamSection) {
            const team = item as EmployeeDataTeamType;
            id = team.teamId;
            nameRow = <p className="body2 truncate">{team.teamName}</p>;
          } else {
            const employee = item as AllEmployeeDataType;
            id = employee.employeeId;
            nameRow = <EmployeeAvatarChip employee={employee} />;
          }

          const assigned = assignments[id];
          const currentItems = getItems(id);
          const currentSearchTerm = searchTerms[id] ?? "";

          const emptyMessage =
            !isSearchLoading &&
            !isTyping[id] &&
            currentSearchTerm.trim() &&
            currentItems.length === 0 ? (
              <p className="px-4 py-2 body2 text-secondary-text">
                {translateText(["noEmployeesFound"])}
              </p>
            ) : undefined;

          return (
            <div
              key={id}
              className="flex flex-row items-center justify-between gap-3 min-h-10.25"
            >
              <div
                className={
                  showAvatar
                    ? "flex-1 min-w-0 overflow-hidden"
                    : "w-31.25 overflow-hidden shrink-0"
                }
              >
                {nameRow}
              </div>
              <div className="w-62.5 shrink-0">
                {!assigned ? (
                  <SearchableDropdown
                    id={`supervisor-search-${id}`}
                    items={currentItems}
                    onSelect={(item) => onSelectItem(id, item)}
                    value={currentSearchTerm}
                    onChange={(e) => handleInputChange(id, e)}
                    onBlur={() => handleBlur(id)}
                    placeholder={placeholderText}
                    emptyMessage={emptyMessage}
                    customStyles={{ border: "border border-transparent" }}
                  />
                ) : (
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-tertiary-background border border-transparent px-3 py-2.5">
                    <span className="body2 truncate flex-1">
                      {assigned.name}
                    </span>
                    <button
                      type="button"
                      aria-label={removeButtonAriaLabel}
                      className="shrink-0 text-secondary-icon hover:text-secondary-text leading-none"
                      onClick={() => onRemove(id)}
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
