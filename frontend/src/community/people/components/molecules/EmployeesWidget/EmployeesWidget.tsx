import { Box, type Theme, Typography, useTheme } from "@mui/material";
import { JSX, useEffect, useState } from "react";

import ToggleSwitch from "~community/common/components/atoms/ToggleSwitch/ToggleSwitch";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useGetEmployeeData } from "~community/people/api/PeopleApi";
import { employeeStatusTypes } from "~community/people/constants/peopleDashboardConstants";
import { usePeopleStore } from "~community/people/store/store";
import { DataFilterEnums } from "~community/people/types/EmployeeTypes";
import { AllEmployeeDataType } from "~community/people/types/PeopleTypes";

import EmployeeList from "./EmployeeList";
import styles from "./styles";

interface Props {
  team: string | number;
}
const EmployeesWidget = ({ team }: Props): JSX.Element => {
  const translateText = useTranslator("peopleModule");
  const theme: Theme = useTheme();
  const classes = styles(theme);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataCategory, setDataCategory] = useState(
    employeeStatusTypes.PENDING.value
  );
  const [employeeDataItems, setEmployeeDataItems] = useState<
    AllEmployeeDataType[]
  >([]);
  const [isConcatinationDone, setIsConcatinationDone] =
    useState<boolean>(false);

  const {
    data: employeeData,
    fetchNextPage,
    isLoading: isEmployeeDataLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage
  } = useGetEmployeeData();

  const { setSearchKeyword, setEmployeeDataParams } = usePeopleStore(
    (state) => state
  );

  useEffect(() => {
    setEmployeeDataParams(DataFilterEnums.ACCOUNT_STATUS, [dataCategory]);
    setEmployeeDataParams(DataFilterEnums.TEAM, team === -1 ? [""] : [team]);
    if (employeeData?.pages) {
      const employeeDataItems = employeeData?.pages
        ?.map((page: any) => page?.items)
        ?.flat();
      setEmployeeDataItems(employeeDataItems);
      setIsConcatinationDone(true);
    } else if (isFetching && !isEmployeeDataLoading) {
      setIsConcatinationDone(true);
    } else {
      setIsConcatinationDone(false);
    }
  }, [
    employeeData,
    isEmployeeDataLoading,
    isFetching,
    isFetchingNextPage,
    team,
    dataCategory
  ]);

  useEffect(() => {
    setSearchKeyword(searchTerm.trimStart());
  }, [searchTerm, setSearchKeyword]);

  return (
    <>
      <Box sx={classes.widgetContainer}>
        <>
          <Box sx={classes.widgetPanel}>
            <Box sx={classes.widgetHeader}>
              <Typography sx={classes.title}>
                {translateText(["dashboard.people"])}
              </Typography>
              <ToggleSwitch
                options={[
                  { value: employeeStatusTypes.ACTIVE.label },
                  { value: employeeStatusTypes.PENDING.label }
                ]}
                setCategoryOption={(option: string) => {
                  setDataCategory(
                    option === employeeStatusTypes.ACTIVE.label
                      ? employeeStatusTypes.ACTIVE.value
                      : employeeStatusTypes.PENDING.value
                  );
                }}
                categoryOption={
                  dataCategory === employeeStatusTypes.ACTIVE.value
                    ? employeeStatusTypes.ACTIVE.label
                    : employeeStatusTypes.PENDING.label
                }
              />
            </Box>
            <Box>
              <Box sx={classes.search}>
                <SearchBox
                  value={searchTerm}
                  setSearchTerm={setSearchTerm}
                  placeHolder={translateText([
                    "peoples.employeeSearchPlaceholder"
                  ])}
                />
              </Box>
              <EmployeeList
                employeeData={employeeDataItems}
                fetchNextPage={fetchNextPage}
                isFetching={!isConcatinationDone}
                isFetchingNextPage={isFetchingNextPage}
                onSearch={searchTerm?.length > 0}
                hasNextPage={hasNextPage}
              />
            </Box>
          </Box>
        </>
      </Box>
    </>
  );
};

export default EmployeesWidget;
