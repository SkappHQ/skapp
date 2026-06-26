import {
  ButtonV2,
  DropdownOption,
  DropdownValue,
  DropdownWithSearchablePopup,
  TriggerProps
} from "@rootcodelabs/skapp-ui";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import DropDownArrow from "~community/common/assets/Icons/DropdownArrow";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { ManagerTeamType } from "~community/common/types/CommonTypes";
import {
  useGetAllManagerTeams,
  useGetAllTeams
} from "~community/people/api/TeamApi";
import { TeamType } from "~community/people/types/TeamTypes";

interface Props {
  setTeamId: (id: number | string) => void;
  setTeamName?: (name: string) => void;
  moduleAdminType?: AdminTypes;
}

const ALL_TEAMS_OPTION_ID = -1;

const TeamSelector = ({
  setTeamId,
  setTeamName,
  moduleAdminType
}: Props): JSX.Element => {
  const translateTexts = useTranslator("commonComponents", "teamSelector");

  const { data: allTeamsData } = useGetAllTeams();
  const { data: managerAllTeamsData } = useGetAllManagerTeams();
  const { user } = useAuth();
  const [teamsData, setTeamsData] = useState<
    TeamType[] | undefined | ManagerTeamType[]
  >([]);

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const isTeamListEmpty = teamsData?.length === 0;
  const [selectedValue, setSelectedValue] = useState<DropdownOption | null>(
    null
  );

  const allTeamsLabel = translateTexts(["allLabel"]);

  const allTeamsOption = useMemo<DropdownOption>(
    () => ({
      id: ALL_TEAMS_OPTION_ID,
      value: ALL_TEAMS_OPTION_ID,
      label: allTeamsLabel
    }),
    [allTeamsLabel]
  );

  const options = useMemo<DropdownOption[]>(
    () => [
      allTeamsOption,
      ...(teamsData?.map((item) => ({
        id: item.teamId,
        value: item.teamId,
        label: item.teamName
      })) ?? [])
    ],
    [allTeamsOption, teamsData]
  );

  const checkUserRole = useCallback(() => {
    if (
      user?.roles?.includes(AdminTypes.SUPER_ADMIN) ||
      (moduleAdminType && user?.roles?.includes(moduleAdminType))
    ) {
      setIsAdmin(true);
      setTeamId(-1);
      setTeamsData(allTeamsData);
      setSelectedValue(allTeamsData?.length === 0 ? null : allTeamsOption);
    } else {
      setTeamId(-1);
      setTeamsData(managerAllTeamsData?.managerTeams);
      setIsAdmin(false);
      setSelectedValue(
        managerAllTeamsData?.managerTeams.length === 0 ? null : allTeamsOption
      );
    }
  }, [
    user,
    managerAllTeamsData,
    allTeamsData,
    moduleAdminType,
    allTeamsOption,
    setTeamId
  ]);

  useEffect(() => {
    checkUserRole();
  }, [checkUserRole]);

  const handleChange = (value: DropdownValue | null): void => {
    const option = value as DropdownOption;

    if (option.id === ALL_TEAMS_OPTION_ID) {
      setTeamId(-1);
      setTeamName?.(translateTexts(["allLabel"]));
    } else {
      setTeamId(option.id);
      setTeamName?.(option.label as string);
    }
    setSelectedValue(option);
  };

  return (
    <div className="pl-4">
      <DropdownWithSearchablePopup
        options={options}
        value={selectedValue}
        onChange={handleChange}
        searchable={true}
        searchPlaceholder={translateTexts(["searchTeamPlaceholder"])}
        maxHeight="max-h-44"
        popupWidth="w-[16.25rem]"
        popupAlignment="right"
        disabled={isTeamListEmpty && !isAdmin}
        renderTrigger={(
          _value: DropdownValue | null,
          _isOpen: boolean,
          disabled: boolean,
          triggerProps: TriggerProps
        ) => {
          const label =
            !isTeamListEmpty && selectedValue
              ? (selectedValue.label as string)
              : translateTexts(["allLabel"]);
          return (
            <div
              ref={triggerProps.ref as React.RefObject<HTMLDivElement>}
              className="inline-flex"
            >
              <ButtonV2
                onClick={triggerProps.onClick}
                onKeyDown={
                  triggerProps.onKeyDown as React.KeyboardEventHandler<HTMLButtonElement>
                }
                aria-expanded={triggerProps["aria-expanded"]}
                aria-haspopup={triggerProps["aria-haspopup"]}
                variant={"tertiary"}
                size={"md"}
                disabled={disabled}
                icon={<DropDownArrow />}
                iconPosition="end"
              >
                {label}
              </ButtonV2>
            </div>
          );
        }}
      />
    </div>
  );
};

export default TeamSelector;
