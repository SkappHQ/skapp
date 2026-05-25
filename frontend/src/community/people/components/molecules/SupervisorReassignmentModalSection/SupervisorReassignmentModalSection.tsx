import { AutoCompleteDropdown, AvatarChip } from "@rootcodelabs/skapp-ui";
import { FC, ReactNode, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { OptionType } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import {
  AllEmployeeDataType,
  EmployeeDataTeamType
} from "~community/people/types/PeopleTypes";
import { concatStrings } from "~community/people/utils/jobFamilyUtils/commonUtils";

type SectionItem = AllEmployeeDataType | EmployeeDataTeamType;

interface SupervisorReassignmentModalSectionProps {
  title: string;
  items: SectionItem[];
  showAvatar: boolean;
  isTeamSection: boolean;
  isSearchLoading: boolean;
  assignments: Record<number, OptionType>;
  getResults: (entityId: number) => ReactNode[];
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
  getResults,
  onBlur,
  onSearch,
  onRemove
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const translateText = useTranslator("peopleModule", "supervisorReassignment");
  const translateConfig = useTranslator("configurations", "workLocation");
  const removeButtonAriaLabel = translateText(["removeAssignment"]);
  const placeholderText = translateText(["selectSupervisorPlaceholder"]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    onSearch(term);
  };

  const handleBlur = () => {
    setSearchTerm("");
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
            nameRow = (
              <AvatarChip
                avatarProps={{
                  id: String(id),
                  firstName: employee.firstName,
                  lastName: employee.lastName,
                  src: employee.authPic
                }}
                label={concatStrings([
                  employee.firstName,
                  employee.lastName
                ]).trim()}
              />
            );
          }

          const assigned = assignments[id];

          const getNoResultsText = () => {
            if (isSearchLoading) return translateText(["loadingEmployees"]);

            if (!searchTerm.trim())
              return translateConfig([
                "form",
                "employeeMultiSelect",
                "ariaLabelSearch"
              ]);

            return translateText(["noEmployeesFound"]);
          };

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
                  <AutoCompleteDropdown
                    hasCard={false}
                    className="w-full!"
                    onBlur={handleBlur}
                    placeholder={placeholderText}
                    onSearch={handleSearch}
                    accessibilityTexts={{
                      noResultsFoundText: getNoResultsText()
                    }}
                    results={getResults(id)}
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
