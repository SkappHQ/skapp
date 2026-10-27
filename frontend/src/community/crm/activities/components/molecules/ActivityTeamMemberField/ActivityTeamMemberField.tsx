import { InputField, SearchIcon } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useMemo, useState } from "react";

import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { filterCRMEmployees } from "~community/crm/activities/utils/activityFilterUtil";
import SelectableSearchField from "~community/crm/components/molecules/SelectableSearchField/SelectableSearchField";
import { CrmOwnerEntity } from "~community/crm/types/CrmCommonTypes";

export interface ActivityTeamMemberFieldProps {
  id: string;
  teamMembers: CrmOwnerEntity[];
  selectedOwnerId?: number;
  isError: boolean;
  onChange: (ownerId: number | null) => void;
}

const TEAM_MEMBER_KEYS = ["activities", "toolbar", "filters", "teamMember"];

const getMemberName = (member: CrmOwnerEntity): string =>
  [member.firstName, member.lastName].filter(Boolean).join(" ");

const ActivityTeamMemberField: FC<ActivityTeamMemberFieldProps> = ({
  id,
  teamMembers,
  selectedOwnerId,
  isError,
  onChange
}) => {
  const translateText = useTranslator("crmModule");
  const translateAria = useTranslator("crmAria");

  const [searchValue, setSearchValue] = useState("");

  const selectedMember = teamMembers.find(
    (member) => member.employeeId === selectedOwnerId
  );

  const items: SearchableDropdownItem[] = useMemo(
    () =>
      filterCRMEmployees(teamMembers, searchValue).map((member) => ({
        id: String(member.employeeId),
        content: <span className="body2">{getMemberName(member)}</span>
      })),
    [teamMembers, searchValue]
  );

  const label = translateText([...TEAM_MEMBER_KEYS, "label"]);
  const placeholder = translateText([...TEAM_MEMBER_KEYS, "placeholder"]);

  if (isError) {
    return (
      <div className="flex w-full flex-col gap-1">
        <InputField
          id={`${id}-input`}
          label={label}
          placeholder={placeholder}
          aria-describedby={`${id}-error`}
          rightIcon={<SearchIcon />}
          value=""
          fullWidth
          readOnly
          disabled
        />
        <p id={`${id}-error`} className="body3 text-semantic-red-accent">
          {translateText([...TEAM_MEMBER_KEYS, "loadErrorInline"])}
        </p>
      </div>
    );
  }

  const isListEmpty = teamMembers.length === 0;

  return (
    <div className="flex w-full flex-col gap-1">
      <SelectableSearchField
        id={id}
        label={label}
        placeholder={placeholder}
        selectedValue={selectedMember ? getMemberName(selectedMember) : ""}
        onClear={() => {
          setSearchValue("");
          onChange(null);
        }}
        clearAriaLabel={translateAria([
          "activities",
          "toolbar",
          "clearTeamMember"
        ])}
        fieldAriaLabel={translateAria(["activities", "toolbar", "teamMember"])}
        searchValue={searchValue}
        onSearchChange={(event: ChangeEvent<HTMLInputElement>) =>
          setSearchValue(event.target.value)
        }
        items={items}
        onSelect={(item) => onChange(Number(item.id))}
        emptyMessage={translateText([
          ...TEAM_MEMBER_KEYS,
          isListEmpty ? "noTeamMembers" : "noMatches"
        ])}
      />
    </div>
  );
};

export default ActivityTeamMemberField;
