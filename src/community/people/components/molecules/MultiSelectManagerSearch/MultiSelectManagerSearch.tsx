import { CircularProgress, Stack } from "@mui/material";
import { Box, type Theme, useTheme } from "@mui/system";
import { ChangeEvent, Dispatch, JSX, SetStateAction } from "react";

import Checkbox from "~community/common/components/atoms/Checkbox/Checkbox";
import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import { usePeopleStore } from "~community/people/store/store";
import { EmployeeDataType } from "~community/people/types/EmployeeTypes";
import { L4ManagerType } from "~community/people/types/PeopleTypes";

interface Props {
  selectedManagers: L4ManagerType[];
  setSelectedManagers: Dispatch<SetStateAction<L4ManagerType[]>>;
  managerSuggestions: EmployeeDataType[];
  hasAllSelector?: boolean;
  onManagerSearchChange: (
    e?: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    searchTerm?: string
  ) => Promise<void>;
  managerSearchTerm: string;
  isSearchResultsLoading?: boolean;
}

const MultiSelectManagerSearch = ({
  selectedManagers,
  setSelectedManagers,
  managerSuggestions,
  onManagerSearchChange,
  managerSearchTerm,
  isSearchResultsLoading
}: Props): JSX.Element => {
  const theme: Theme = useTheme();

  const { employee: currentEmployee, setEmploymentDetails } = usePeopleStore(
    (state) => state
  );

  const toggleManagerSelection = (
    employee: EmployeeDataType | L4ManagerType
  ) => {
    const isSelected = selectedManagers.some(
      (manager) => manager.employeeId === Number(employee.employeeId)
    );

    const newSelectedManagers = isSelected
      ? selectedManagers.filter(
          (manager) => manager.employeeId !== Number(employee.employeeId)
        )
      : [
          ...selectedManagers,
          {
            employeeId: Number(employee.employeeId),
            firstName: employee.firstName,
            lastName: employee.lastName,
            authPic: employee.authPic
          }
        ];

    setSelectedManagers(newSelectedManagers);
    setEmploymentDetails({
      employmentDetails: {
        ...currentEmployee.employment?.employmentDetails,
        otherSupervisors: newSelectedManagers
      }
    });
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.grey[100], height: "100%" }}>
      <Box sx={{ p: "0.5rem" }}>
        <SearchBox
          label={""}
          value={managerSearchTerm}
          setSearchTerm={(value: string) => {
            const searchTerm = value.trimStart();
            onManagerSearchChange(undefined, searchTerm);
          }}
          paperStyles={{
            height: "2.375rem",
            backgroundColor: "white"
          }}
          isSearchIconVisible={false}
          autoFocus={true}
        />
      </Box>
      {isSearchResultsLoading && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            my: "0.5rem"
          }}
        >
          <CircularProgress />
        </Box>
      )}
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
        {(managerSearchTerm?.trim() === ""
          ? selectedManagers.map((manager) => ({
              employeeId: manager.employeeId,
              firstName: manager.firstName,
              lastName: manager.lastName,
              authPic: manager.authPic
            }))
          : (managerSuggestions || []).filter(
              (suggestion) =>
                !selectedManagers.some(
                  (manager) => manager.employeeId === suggestion.employeeId
                )
            )
        ).map((employee: EmployeeDataType | L4ManagerType) => {
          const isSelected = selectedManagers.some(
            (manager) => manager.employeeId === Number(employee.employeeId)
          );

          return (
            <Stack
              key={employee.employeeId}
              direction="row"
              sx={{
                width: "100%",
                px: "0.75rem",
                backgroundColor: !isSelected
                  ? theme.palette.grey[100]
                  : theme.palette.secondary.main
              }}
            >
              <Checkbox
                label={""}
                name={""}
                checked={isSelected}
                onChange={() => toggleManagerSelection(employee)}
                customStyles={{
                  color: theme.palette.primary.dark,
                  "&.Mui-checked": {
                    color: theme.palette.primary.dark
                  }
                }}
              />
              <AvatarChip
                key={employee.employeeId}
                firstName={employee.firstName ?? ""}
                lastName={employee.lastName ?? ""}
                avatarUrl={employee.authPic}
                isResponsiveLayout={true}
                chipStyles={{
                  color: "common.black",
                  height: "3rem",
                  border: isSelected
                    ? `.0625rem solid ${theme.palette.secondary.dark}`
                    : "common.white",
                  my: ".75rem",
                  py: "0.75rem",
                  "&:hover": {
                    backgroundColor: "common.white"
                  }
                }}
                onClickChip={() => toggleManagerSelection(employee)}
              />
            </Stack>
          );
        })}
      </Box>
    </Box>
  );
};

export default MultiSelectManagerSearch;
