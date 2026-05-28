import { FC, ReactNode, useState } from "react";
import Select, {
  type DropdownIndicatorProps,
  type InputActionMeta,
  components
} from "react-select";

import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import { useGetSelectStyles } from "~community/common/components/molecules/DropDownSearch/styles";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  DropdownListType,
  OptionType
} from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import {
  AllEmployeeDataType,
  EmployeeDataTeamType
} from "~community/people/types/PeopleTypes";

type SectionItem = AllEmployeeDataType | EmployeeDataTeamType;

interface SupervisorReassignmentModalSectionProps {
  title: string;
  items: SectionItem[];
  showAvatar: boolean;
  isTeamSection: boolean;
  assignments: Record<number, OptionType>;
  isSearchLoading: boolean;
  getItemOptions: (entityId: number) => DropdownListType[];
  onSelect: (
    entityId: number,
    employeeId: number,
    employeeName: string
  ) => void;
  onSearch: (term: string) => void;
  onRemove: (entityId: number) => void;
}

const DropdownIndicator = (props: DropdownIndicatorProps): ReactNode => (
  <components.DropdownIndicator {...props}>
    <Icon name={IconName.SEARCH_ICON} width="15" height="15" />
  </components.DropdownIndicator>
);

const SupervisorReassignmentModalSection: FC<
  SupervisorReassignmentModalSectionProps
> = ({
  title,
  items,
  showAvatar,
  isTeamSection,
  assignments,
  isSearchLoading,
  getItemOptions,
  onSelect,
  onSearch,
  onRemove
}) => {
  const translateText = useTranslator("peopleModule", "supervisorReassignment");
  const selectStyles = useGetSelectStyles("");
  const removeButtonAriaLabel = translateText(["removeAssignment"]);
  const placeholderText = translateText(["selectSupervisorPlaceholder"]);
  const noResultsText = translateText(["noEmployeesFound"]);

  const [inputValues, setInputValues] = useState<Record<number, string>>({});

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
                firstName={employee.firstName}
                lastName={employee.lastName}
                avatarUrl={employee.authPic}
                chipStyles={{
                  justifyContent: "flex-start",
                  backgroundColor: "transparent",
                  color: "inherit",
                  "& .MuiChip-label": {
                    typography: "body2",
                    paddingRight: 0
                  }
                }}
              />
            );
          }

          const assigned = assignments[id];
          const currentInput = inputValues[id] ?? "";

          const handleInputChange = (
            inputText: string,
            { action }: InputActionMeta
          ) => {
            if (action === "input-change") {
              setInputValues((prev) => ({ ...prev, [id]: inputText }));
              onSearch(inputText);
            }
          };

          const handleMenuClose = () => {
            setInputValues((prev) => ({ ...prev, [id]: "" }));
            onSearch("");
          };

          const handleChange = (selectedOption: unknown) => {
            const supervisorOption = selectedOption as DropdownListType;
            if (supervisorOption) {
              onSelect(
                id,
                supervisorOption.value as number,
                supervisorOption.label as string
              );
            }
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
                  <Select
                    inputValue={currentInput}
                    onInputChange={handleInputChange}
                    value={null}
                    options={getItemOptions(id)}
                    placeholder={placeholderText}
                    onChange={handleChange}
                    onMenuClose={handleMenuClose}
                    menuIsOpen={currentInput.trim().length > 0}
                    filterOption={() => true}
                    noOptionsMessage={() =>
                      isSearchLoading ? null : noResultsText
                    }
                    styles={{
                      ...selectStyles,
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: ZIndexEnums.NEWMODAL
                      }),
                      menuList: (base) => ({
                        ...base,
                        marginTop: 0,
                        maxHeight: "10.625rem",
                        overflowY: "auto"
                      }),
                      menu: (base) => ({
                        ...base,
                        marginTop: 0
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        marginLeft: "1rem",
                        padding: "auto",
                        height: "2.5625rem",
                        overflowY: "auto"
                      })
                    }}
                    menuPortalTarget={
                      typeof window !== "undefined" ? document.body : undefined
                    }
                    components={{ DropdownIndicator }}
                  />
                ) : (
                  <div className="h-10.25 flex items-center justify-between gap-2 rounded-lg bg-tertiary-background border border-transparent px-3">
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
