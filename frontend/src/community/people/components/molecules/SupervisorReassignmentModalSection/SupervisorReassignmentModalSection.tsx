import { AvatarChip, CloseIcon, InputField } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, ReactNode, useState } from "react";

import SearchableDropdown, {
  SearchableDropdownItem
} from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import useGetImageUrl from "~community/common/hooks/useGetImageUrl";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { OptionType } from "~community/common/types/CommonTypes";
import {
  AllEmployeeDataType,
  EmployeeDataTeamType
} from "~community/people/types/PeopleTypes";
import { concatStrings } from "~community/common/utils/commonUtil";

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
  isLoading: boolean;
  assignments: Record<number, OptionType>;
  getItems: (entityId: number) => SearchableDropdownItem[];
  onSearch: (term: string) => void;
  onSelect: (
    entityId: number,
    selectedId: string,
    selectedName: string
  ) => void;
  onRemove: (entityId: number) => void;
}

const SupervisorReassignmentModalSection: FC<
  SupervisorReassignmentModalSectionProps
> = ({
  title,
  items,
  showAvatar,
  isTeamSection,
  isLoading,
  assignments,
  getItems,
  onSearch,
  onSelect,
  onRemove
}) => {
  const [searchValues, setSearchValues] = useState<Record<number, string>>({});
  const translateText = useTranslator("peopleModule", "supervisorReassignment");
  const removeButtonAriaLabel = translateText(["removeAssignment"]);
  const placeholderText = translateText(["selectSupervisorPlaceholder"]);

  const handleInputChange = (
    entityId: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const term = e.target.value;
    setSearchValues({ [entityId]: term });
    onSearch(term);
  };

  const handleItemSelect = (entityId: number, item: SearchableDropdownItem) => {
    setSearchValues((prev) => ({ ...prev, [entityId]: "" }));
    onSelect(entityId, item.id, String(item.content));
  };

  const handleDropdownClose = (entityId: number) => {
    setSearchValues((prev) => ({ ...prev, [entityId]: "" }));
    onSearch("");
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
                    id={`supervisor-reassignment-${id}`}
                    items={getItems(id)}
                    onSelect={(item) => handleItemSelect(id, item)}
                    value={searchValues[id] ?? ""}
                    onChange={(e) => handleInputChange(id, e)}
                    placeholder={placeholderText}
                    variant="sm"
                    positionStrategy="fixed"
                    onClose={() => handleDropdownClose(id)}
                    emptyMessage={
                      isLoading ? undefined : (
                        <p className="px-4 py-2 body2">
                          {translateText(["noEmployeesFound"])}
                        </p>
                      )
                    }
                  />
                ) : (
                  <InputField
                    value={assigned.name}
                    readOnly
                    variant="sm"
                    fullWidth
                    className="[&_.border-primary-accent]:border-secondary-accent"
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => onRemove(id)}
                        aria-label={removeButtonAriaLabel}
                        className="flex items-center justify-center cursor-pointer"
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    }
                  />
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
