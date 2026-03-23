import { Checkbox } from "@mui/material";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import { FC, useState } from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import KebabMenu from "~community/common/components/molecules/KebabMenu/KebabMenu";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { EmployeeDataType } from "~community/people/types/EmployeeTypes";
import { TeamMemberTypes } from "~community/people/types/TeamTypes";

interface Props {
  allUsers: EmployeeDataType[];
  teamMembers: TeamMemberTypes;
  setTeamMembers: (teamMembers: TeamMemberTypes) => void;
  setIsSelectMembersOpen: (value: boolean) => void;
}

const AddTeamSelectMembers: FC<Props> = ({
  allUsers,
  teamMembers,
  setTeamMembers,
  setIsSelectMembersOpen
}) => {
  const translateText = useTranslator("peopleModule", "teams");

  const [usersChecked, setUsersChecked] = useState<readonly EmployeeDataType[]>(
    []
  );

  const handelToggle = (value: EmployeeDataType) => () => {
    const currentIndex: number = usersChecked?.indexOf(value);
    const newChecked: EmployeeDataType[] = [...usersChecked];
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setUsersChecked(newChecked);
  };

  const handelSelectUnselectButton = (): void => {
    if (usersChecked?.length === allUsers?.length) {
      setUsersChecked([]);
    } else {
      setUsersChecked(allUsers);
    }
  };

  const handleRemove = (): void => {
    if (usersChecked?.length > 0) {
      const newMembers = teamMembers?.members?.filter(
        (member) =>
          !usersChecked?.find((user) => user?.employeeId === member?.employeeId)
      );
      const newSupervisor = teamMembers?.supervisor?.filter(
        (supervisor) =>
          !usersChecked?.find(
            (user) => user?.employeeId === supervisor?.employeeId
          )
      );
      setTeamMembers({
        members: newMembers,
        supervisor: newSupervisor
      });
      setIsSelectMembersOpen(false);
    }
  };

  const kebabMenuOptions = [
    {
      id: 1,
      text:
        usersChecked?.length === allUsers?.length
          ? translateText(["unSelectAllMembers"])
          : translateText(["selectAllMembers"]),
      onClickHandler: () => {
        handelSelectUnselectButton();
      },
      isDisabled: false
    }
  ];

  return (
    <>
      <div>
        <div className="flex flex-row justify-between mr-5 mt-2">
          <p className="text-base font-medium leading-6">
            {translateText(["memberListTitle"])}
          </p>
          <KebabMenu
            id="add-team-kebab-menu"
            menuItems={kebabMenuOptions}
            icon={<Icon name={IconName.MORE_ICON} />}
            customStyles={{ menu: { zIndex: ZIndexEnums.NEWMODAL } }}
          />
        </div>

        {allUsers?.length && (
          <div className="mr-5 mt-3 flex flex-col gap-3 max-h-[20vh] overflow-auto items-start">
            {allUsers?.map((user: EmployeeDataType) => {
              return (
                <div
                  key={user?.employeeId}
                  className="w-full flex flex-row items-center py-0.5"
                >
                  <Checkbox
                    checked={usersChecked?.includes(user)}
                    inputProps={{
                      "aria-label": `${user?.firstName ?? ""} ${user?.lastName ?? ""} ${user?.jobLevel ?? ""} ${user?.jobRole ?? ""}`
                    }}
                    sx={{ p: 0, color: "primary.main", "&.Mui-checked": { color: "primary.main" } }}
                    onClick={handelToggle(user)}
                  />
                  <AvatarChip
                    firstName={user?.firstName}
                    lastName={user?.lastName}
                    avatarUrl={user?.avatarUrl}
                    isResponsiveLayout={false}
                    chipStyles={{ color: "common.black", p: 0, ml: ".875rem" }}
                  />
                  <p className="ml-3 text-xs font-normal" style={{ color: "var(--palette-primary-dark)" }}>
                    {`${user?.jobLevel ?? ""} ${user?.jobRole ?? ""}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="flex flex-row justify-end gap-3 mt-4">
        <ButtonV2
          variant={"tertiary"}
          onClick={() => {
            setIsSelectMembersOpen(false);
          }}
          icon={<Icon name={IconName.CLOSE_ICON} />}
          iconPosition="end"
        >
          {translateText(["cancelBtnText"])}
        </ButtonV2>
        <ButtonV2
          variant={"error"}
          disabled={!(usersChecked?.length > 0)}
          onClick={handleRemove}
          icon={<Icon name={IconName.DELETE_BUTTON_ICON} fill={(usersChecked?.length > 0) ? "var(--color-semantic-red-text)" : undefined} />}
          iconPosition="end"
        >
          {translateText(["removeFromTeam"])}
        </ButtonV2>
      </div>
    </>
  );
};

export default AddTeamSelectMembers;
