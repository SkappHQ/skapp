import { InputField, SearchIcon } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useMemo, useState } from "react";

import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { filterCRMEmployees } from "~community/crm/activities/utils/activityFilterUtil";
import SelectableSearchField from "~community/crm/components/molecules/SelectableSearchField/SelectableSearchField";
import { CrmOwnerEntity } from "~community/crm/types/CrmCommonTypes";
import { getOwnerName, toOwnersRecord } from "~community/crm/utils/commonUtil";

export interface ActivityTeamMemberFieldProps {
  id: string;
  teamMembers: CrmOwnerEntity[];
  selectedOwnerId?: number;
  isError: boolean;
  onChange: (ownerId: number | null) => void;
}

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

  const TEAM_MEMBER_KEYS = ["activities", "toolbar", "filters", "teamMember"];

  const teamMembersRecord = useMemo(
    () => toOwnersRecord(teamMembers),
    [teamMembers]
  );

  const items: SearchableDropdownItem[] = useMemo(
    () =>
      filterCRMEmployees(teamMembers, searchValue).map((member) => ({
        id: String(member.employeeId),
        content: (
          <span className="body2">
            {getOwnerName(teamMembersRecord, member.employeeId)}
          </span>
        )
      })),
    [teamMembers, teamMembersRecord, searchValue]
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

  return (
    <div className="flex w-full flex-col gap-1">
      <SelectableSearchField
        positionStrategy="fixed"
        id={id}
        label={label}
        placeholder={placeholder}
        selectedValue={getOwnerName(teamMembersRecord, selectedOwnerId)}
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
          teamMembers.length === 0 ? "noTeamMembers" : "noMatches"
        ])}
      />
    </div>
  );
};

export default ActivityTeamMemberField;
