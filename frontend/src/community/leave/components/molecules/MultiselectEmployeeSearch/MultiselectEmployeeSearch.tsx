import { Stack } from "@mui/material";
import { Box, type Theme, useTheme } from "@mui/system";
import { ButtonV2 } from "@rootcodelabs/skapp-ui";
import {
  Dispatch,
  JSX,
  SetStateAction,
  useCallback,
  useEffect,
  useState
} from "react";

import Icon from "~community/common/components/atoms/Icon/Icon";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { Employee } from "~community/leave/types/TeamLeaveAnalyticsTypes";

interface Props {
  teamDetails: Employee[];
  selectedMembers: number[];
  setSelectedMembers: Dispatch<SetStateAction<number[]>>;
  isAll: boolean;
  setIsAll: Dispatch<SetStateAction<boolean>>;
  teamMembers: Employee[];
  setTeamMembers: Dispatch<SetStateAction<Employee[]>>;
}

const MultiselectEmployeeSearch = ({
  teamDetails,
  selectedMembers,
  setSelectedMembers,
  isAll,
  setIsAll,
  teamMembers,
  setTeamMembers
}: Props): JSX.Element => {
  const theme: Theme = useTheme();
  const translateText = useTranslator("leaveModule", "analytics");
  const [teamMemberSearchTerm, setTeamMemberSearchTerm] = useState<string>("");
  const [searchedMembers, setSearchedMembers] = useState<Employee[]>([]);

  const searchMembers = useCallback(() => {
    setSearchedMembers([]);
    const newSearchedMembers = teamDetails?.filter((employee) => {
      const firstName = employee.employee.firstName.toLowerCase().trim();
      const lastName = employee.employee.lastName.toLowerCase().trim();
      return (
        firstName
          .toLowerCase()
          .startsWith(teamMemberSearchTerm.toLowerCase()) ||
        lastName.toLowerCase().startsWith(teamMemberSearchTerm.toLowerCase())
      );
    });
    setSearchedMembers(newSearchedMembers);
  }, [teamDetails, teamMemberSearchTerm]);

  useEffect(() => {
    searchMembers();
  }, [searchMembers, teamMemberSearchTerm]);

  const getSelectedToTop = (employeeId: number) => {
    const index = selectedMembers.indexOf(employeeId);
    const memberIndex = teamMembers.findIndex(
      (item) => Number(item.employee.employeeId) === employeeId
    );
    const recordToMove = teamMembers[memberIndex];
    const newTeamMemberArray = [...teamMembers];
    newTeamMemberArray.splice(memberIndex, 1);
    index === -1
      ? newTeamMemberArray.unshift(recordToMove)
      : newTeamMemberArray.push(recordToMove);
    setTeamMembers(newTeamMemberArray);
  };

  const updateSelectedMembers = (employeeId: number) => {
    setIsAll(false);
    getSelectedToTop(employeeId);
    setSelectedMembers((prevMembers) => {
      const index = prevMembers.indexOf(employeeId);
      if (index === -1) {
        return [...prevMembers, employeeId];
      } else {
        const updatedMembers = [...prevMembers];
        updatedMembers.splice(index, 1);
        if (updatedMembers.length === 0) {
          setIsAll(true);
        }
        return updatedMembers;
      }
    });
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.grey[100], height: "100%" }}>
      <Box sx={{ p: "0.5rem" }}>
        <SearchBox
          label={""}
          value={teamMemberSearchTerm}
          setSearchTerm={setTeamMemberSearchTerm}
          paperStyles={{
            height: "2.375rem",
            backgroundColor: "white"
          }}
        />
      </Box>
      <Box
        sx={{
          overflowY: "auto",
          overflowX: "hidden",
          maxHeight: "15rem",
          mt: "0.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start"
        }}
      >
        {teamMemberSearchTerm.length === 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              px: "0.75rem",
              py: "0.75rem",
              backgroundColor: isAll
                ? theme.palette.secondary.main
                : theme.palette.grey[100]
            }}
            onClick={() => {
              setIsAll(true);
              setSelectedMembers([]);
            }}
          >
            <ButtonV2
              fullWidth={false}
              variant={"secondary"}
              onClick={() => {
                setIsAll(true);
                setSelectedMembers([]);
              }}
            >
              {translateText(["allMembers"])}
            </ButtonV2>
            {isAll && (
              <Icon
                name={IconName.CHECK_CIRCLE_ICON}
                fill={theme.palette.primary.dark}
              />
            )}
          </Box>
        )}
        {(teamMemberSearchTerm.length === 0 && teamMembers?.length > 0
          ? teamMembers
          : searchedMembers
        )?.map((employee: Employee) => {
          return (
            <Stack
              key={employee.employee.employeeId}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              onClick={() =>
                updateSelectedMembers(Number(employee.employee.employeeId))
              }
              sx={{
                width: "100%",
                px: "0.75rem",
                backgroundColor: !selectedMembers.includes(
                  Number(employee.employee.employeeId)
                )
                  ? theme.palette.grey[100]
                  : theme.palette.secondary.main
              }}
            >
              <AvatarChip
                key={employee.employee.employeeId}
                firstName={employee.employee.firstName}
                lastName={employee.employee.lastName}
                avatarUrl={employee.employee.authPic}
                isResponsiveLayout={true}
                chipStyles={{
                  color: "common.black",
                  height: "3rem",
                  border: selectedMembers.includes(
                    Number(employee.employee.employeeId)
                  )
                    ? `.0625rem solid ${theme.palette.secondary.dark}`
                    : null,
                  my: ".75rem",
                  py: "0.75rem"
                }}
                onClickChip={() =>
                  updateSelectedMembers(Number(employee.employee.employeeId))
                }
              />
              <Box>
                {selectedMembers.includes(
                  Number(employee.employee.employeeId)
                ) && (
                  <Icon
                    name={IconName.CHECK_CIRCLE_ICON}
                    fill={theme.palette.primary.dark}
                  />
                )}
              </Box>
            </Stack>
          );
        })}
      </Box>
    </Box>
  );
};

export default MultiselectEmployeeSearch;
