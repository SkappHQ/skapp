import { Box, Stack } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import SearchBox from "~community/common/components/molecules/SearchBox/SearchBox";
import ROUTES from "~community/common/constants/routes";
import { peopleDirectoryTestId } from "~community/common/constants/testIds";
import {
  ButtonSizes,
  ButtonStyle
} from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes, ManagerTypes } from "~community/common/types/AuthTypes";
import { IconName } from "~community/common/types/IconTypes";
import {
  useGetBannerData,
  useGetEmployeeData
} from "~community/people/api/PeopleApi";
import EmployeeDataBanner from "~community/people/components/molecules/EmployeeDataBanner/EmployeeDataBanner";
import PeopleTable from "~community/people/components/molecules/PeopleTable/PeopleTable";
import { usePeopleStore } from "~community/people/store/store";
import {
  DataFilterEnums,
  EmploymentStatusTypes
} from "~community/people/types/EmployeeTypes";
import { AllEmployeeDataType } from "~community/people/types/PeopleTypes";
import RemovePeopleCountBanner from "~enterprise/settings/components/molecules/RemovePeopleCountBanner/RemovePeopleCountBanner";

interface EmployeeDataProps {
  isRemovePeople: boolean;
}

const EmployeeData = ({ isRemovePeople = false }: EmployeeDataProps) => {
  const translateText = useTranslator("peopleModule", "peoples");
  const router = useRouter();
  const { data } = useSession();

  const isPeopleManagerOrSuperAdmin = data?.user.roles?.includes(
    ManagerTypes.PEOPLE_MANAGER || AdminTypes.SUPER_ADMIN
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeDataItems, setEmployeeDataItems] = useState<
    AllEmployeeDataType[]
  >([]);
  const [isConcatenationDone, setIsConcatenationDone] =
    useState<boolean>(false);

  const {
    data: employeeData,
    fetchNextPage,
    isLoading: isEmployeeDataLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage
  } = useGetEmployeeData();

  const {
    isPendingInvitationListOpen,
    selectedEmployees,
    employeeDataParams,
    setSearchKeyword,
    setEmployeeDataParams,
    resetEmployeeDataParams
  } = usePeopleStore((state) => state);

  const { data: bannerData } = useGetBannerData();

  const handleBannerClick = (): void => {
    resetEmployeeDataParams();
    router.push(ROUTES.PEOPLE.PENDING);
  };

  useEffect(() => {
    if (employeeData?.pages) {
      const employeeDataItems = employeeData?.pages
        ?.map((page: any) => page?.items)
        ?.flat();
      setEmployeeDataItems(employeeDataItems);
      setIsConcatenationDone(true);
    } else if (isFetching && !isEmployeeDataLoading) {
      setIsConcatenationDone(true);
    } else {
      setIsConcatenationDone(false);
    }
  }, [
    employeeData,
    isEmployeeDataLoading,
    isFetching,
    isFetchingNextPage,
    isPendingInvitationListOpen
  ]);

  useEffect(() => {
    setSearchKeyword(searchTerm.trimStart());
  }, [searchTerm, setSearchKeyword]);

  useEffect(() => {
    if (
      searchTerm.length > 0 &&
      !isRemovePeople &&
      !isPendingInvitationListOpen
    ) {
      setEmployeeDataParams(DataFilterEnums.ACCOUNT_STATUS, [
        EmploymentStatusTypes.ACTIVE,
        EmploymentStatusTypes.TERMINATED
      ]);
    } else if (
      searchTerm.length === 0 &&
      !isRemovePeople &&
      !isPendingInvitationListOpen
    ) {
      setEmployeeDataParams(DataFilterEnums.ACCOUNT_STATUS, [
        EmploymentStatusTypes.ACTIVE
      ]);
    } else if (isPendingInvitationListOpen) {
      setEmployeeDataParams(DataFilterEnums.ACCOUNT_STATUS, [
        EmploymentStatusTypes.PENDING
      ]);
    } else {
      setEmployeeDataParams(DataFilterEnums.ACCOUNT_STATUS, [
        EmploymentStatusTypes.ACTIVE
      ]);
    }
  }, [
    searchTerm,
    isRemovePeople,
    isPendingInvitationListOpen,
    setEmployeeDataParams
  ]);

  useEffect(() => {
    setSearchTerm("");
    if (isPendingInvitationListOpen) {
      setEmployeeDataParams(DataFilterEnums.PERMISSION, []);
      setEmployeeDataParams(DataFilterEnums.ACCOUNT_STATUS, [
        EmploymentStatusTypes.PENDING
      ]);
    }
  }, [
    isPendingInvitationListOpen,
    resetEmployeeDataParams,
    setEmployeeDataParams
  ]);

  return (
    <Stack>
      <SearchBox
        value={searchTerm}
        setSearchTerm={setSearchTerm}
        placeHolder={translateText(["employeeSearchPlaceholder"])}
        data-testid={peopleDirectoryTestId.searchInput}
        name="contactSearch"
      />
      {bannerData &&
      !isRemovePeople &&
      bannerData > 0 &&
      !isPendingInvitationListOpen &&
      isPeopleManagerOrSuperAdmin ? (
        <EmployeeDataBanner
          startingIcon={IconName.CLOCK_ICON}
          count={bannerData}
          title={translateText(["bannerTitle"])}
          titleForOne={translateText(["bannerTitleForOne"])}
          prompt={translateText(["bannerPrompt"])}
          onClick={handleBannerClick}
        />
      ) : (
        <Box sx={{ height: "1.5rem" }} />
      )}

      {isRemovePeople && (
        <>
          <Stack direction="row" gap={1} justifyContent="flex-start">
            <Button
              label={translateText([
                "filters",
                "selectedFiltersFilterItems",
                "active"
              ])}
              isFullWidth={false}
              buttonStyle={
                employeeDataParams?.accountStatus?.includes(
                  EmploymentStatusTypes.ACTIVE
                )
                  ? ButtonStyle.SECONDARY
                  : ButtonStyle.TERTIARY
              }
              size={ButtonSizes.MEDIUM}
              onClick={() =>
                setEmployeeDataParams(DataFilterEnums.ACCOUNT_STATUS, [
                  EmploymentStatusTypes.ACTIVE
                ])
              }
            />
            <Button
              label={translateText([
                "filters",
                "selectedFiltersFilterItems",
                "pending"
              ])}
              isFullWidth={false}
              buttonStyle={
                employeeDataParams?.accountStatus?.includes(
                  EmploymentStatusTypes.PENDING
                )
                  ? ButtonStyle.SECONDARY
                  : ButtonStyle.TERTIARY
              }
              size={ButtonSizes.MEDIUM}
              onClick={() =>
                setEmployeeDataParams(DataFilterEnums.ACCOUNT_STATUS, [
                  EmploymentStatusTypes.PENDING
                ])
              }
            />
          </Stack>

          <RemovePeopleCountBanner
            startingIcon={IconName.REMOVE_PEOPLE_ICON}
            selectedCount={selectedEmployees.length}
          />
        </>
      )}

      <PeopleTable
        employeeData={employeeDataItems}
        fetchNextPage={fetchNextPage}
        isFetching={!isConcatenationDone}
        isFetchingNextPage={isFetchingNextPage}
        onSearch={searchTerm?.length > 0}
        hasNextPage={hasNextPage}
        isRemovePeople={isRemovePeople}
      />
    </Stack>
  );
};

export default EmployeeData;
