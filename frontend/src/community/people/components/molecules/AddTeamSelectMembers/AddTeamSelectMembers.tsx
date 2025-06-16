import { Box, Checkbox, Stack, Typography } from "@mui/material";
import { type Theme, useTheme } from "@mui/material/styles";
import { FC, useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import KebabMenu from "~community/common/components/molecules/KebabMenu/KebabMenu";
import { ZIndexEnums } from "~community/common/enums/CommonEnums";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { EmployeeDataType } from "~community/people/types/EmployeeTypes";
import { TeamMemberTypes } from "~community/people/types/TeamTypes";

import styles from "./styles";

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
  const theme: Theme = useTheme();
  const classes = styles(theme);
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
      <Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ mr: "1.25rem" }}
        >
          <Typography variant="body1" fontWeight={500} lineHeight="1.5rem">
            {translateText(["memberListTitle"])}
          </Typography>
          <Box>
            <KebabMenu
              id="add-team-kebab-menu"
              menuItems={kebabMenuOptions}
              icon={<Icon name={IconName.MORE_ICON} />}
              customStyles={{ menu: { zIndex: ZIndexEnums.MODAL } }}
            />
          </Box>
        </Stack>

        {allUsers?.length && (
          <Stack
            direction="column"
            sx={classes.userList}
            spacing={".75rem"}
            alignItems={"flex-start"}
            maxHeight={"20vh"}
            overflow="auto"
          >
            {allUsers?.map((user: EmployeeDataType) => {
              return (
                <Stack
                  key={user?.employeeId}
                  width={"100%"}
                  flexDirection="row"
                  alignItems="center"
                  sx={{ py: ".125rem" }}
                >
                  <Checkbox
                    checked={usersChecked?.includes(user)}
                    inputProps={{
                      "aria-label": `${user?.firstName ?? ""} ${user?.lastName ?? ""} ${user?.jobLevel ?? ""} ${user?.jobRole ?? ""}`
                    }}
                    sx={classes.checkBox}
                    onClick={handelToggle(user)}
                  />
                  <AvatarChip
                    firstName={user?.firstName}
                    lastName={user?.lastName}
                    avatarUrl={user?.avatarUrl}
                    isResponsiveLayout={false}
                    chipStyles={classes.avatarChip}
                  />
                  <Typography sx={classes.jobTitle}>
                    {`${user?.jobLevel ?? ""} ${user?.jobRole ?? ""}`}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Box>
      <Box sx={{ mr: "1.25rem" }}>
        <Button
          label={translateText(["removeFromTeam"])}
          buttonStyle={ButtonStyle.ERROR}
          isFullWidth={true}
          styles={{ mt: "1.2rem" }}
          endIcon={<Icon name={IconName.DELETE_BUTTON_ICON} />}
          disabled={!(usersChecked?.length > 0)}
          onClick={handleRemove}
        />
        <Button
          label={translateText(["cancelBtnText"])}
          buttonStyle={ButtonStyle.TERTIARY}
          isFullWidth={true}
          styles={{ mt: "1.2rem" }}
          endIcon={<Icon name={IconName.CLOSE_ICON} />}
          onClick={() => {
            setIsSelectMembersOpen(false);
          }}
        />
      </Box>
    </>
  );
};

export default AddTeamSelectMembers;
