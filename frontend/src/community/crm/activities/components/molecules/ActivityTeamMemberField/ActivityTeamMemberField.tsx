import { InputField, SearchIcon, Tooltip } from "@rootcodelabs/skapp-ui";
import { ChangeEvent, FC, useMemo, useState } from "react";

import { SearchableDropdownItem } from "~community/common/components/molecules/SearchableDropdown/SearchableDropdown";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { ActivityTeamMember } from "~community/crm/activities/types/activityTypes";
import SelectableSearchField from "~community/crm/components/molecules/SelectableSearchField/SelectableSearchField";

export interface ActivityTeamMemberFieldProps {
  id: string;
  teamMembers: ActivityTeamMember[];
  selectedOwnerId: number | null;
  isError: boolean;
  onChange: (ownerId: number | null) => void;
}

const TEAM_MEMBER_KEYS = ["activities", "toolbar", "filters", "teamMember"];

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
    (member) => member.id === selectedOwnerId
  );

  const items: SearchableDropdownItem[] = useMemo(
    () =>
      teamMembers
        .filter((member) =>
          member.name.toLowerCase().includes(searchValue.trim().toLowerCase())
        )
        .map((member) => ({
        id: String(member.id),
        content: <span className="body2">{member.name}</span>
      })),
    [teamMembers, searchValue]
  );

  const label = translateText([...TEAM_MEMBER_KEYS, "label"]);
  const placeholder = translateText([...TEAM_MEMBER_KEYS, "placeholder"]);

  if (isError) {
    return (
      <div className="flex w-full flex-col gap-1">
        <Tooltip
          id={`${id}-error-tooltip`}
          content={translateText([...TEAM_MEMBER_KEYS, "loadError"])}
          position="bottom"
        >
          <div className="w-full">
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
          </div>
        </Tooltip>
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
        selectedValue={selectedMember?.name ?? ""}
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
      {isListEmpty && (
        <p id={`${id}-empty`} className="body3 text-secondary-text">
          {translateText([...TEAM_MEMBER_KEYS, "noTeamMembers"])}
        </p>
      )}
    </div>
  );
};

export default ActivityTeamMemberField;
