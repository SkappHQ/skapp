import { NextPage } from "next";
import { useEffect, useState } from "react";

import { useAuth } from "~community/auth/providers/AuthProvider";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { AdminTypes } from "~community/common/types/AuthTypes";
import { useGetAllHolidaysInfinite } from "~community/people/api/HolidayApi";
import HolidayDataTable from "~community/people/components/molecules/HolidayTable/HolidayTable";
import HolidayModalController from "~community/people/components/organisms/HolidayModalController/HolidayModalController";
import { usePeopleStore } from "~community/people/store/store";
import {
  Holiday,
  holidayModalTypes
} from "~community/people/types/HolidayTypes";

const Holidays: NextPage = () => {
  const translateText = useTranslator("peopleModule");

  const [setPopupTitle] = useState<string | undefined>();
  const [holidayDataItems, setHolidayDataItems] = useState<Holiday[]>([]);
  const [isConcatenationDone, setIsConcatenationDone] =
    useState<boolean>(false);

  const { user } = useAuth();

  const isAdmin = user?.roles?.includes(AdminTypes.PEOPLE_ADMIN);

  const {
    setIsHolidayModalOpen,
    setHolidayModalType,
    selectedYear,
    holidayDataParams,
    selectedWorkLocationId
  } = usePeopleStore((state) => state);

  const {
    data: holidays,
    refetch,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading: isHolidayDataLoading
  } = useGetAllHolidaysInfinite(
    selectedYear,
    holidayDataParams.sortOrder,
    selectedWorkLocationId
  );

  const handleAddHoliday = () => {
    setHolidayModalType(holidayModalTypes.ADD_EDIT_HOLIDAY);
    setIsHolidayModalOpen(true);
  };
  useEffect(() => {
    if (selectedYear) {
      refetch();
    }
  }, [selectedYear, refetch, holidays]);

  const primaryButtonText =
    Boolean(holidays?.pages[0]?.items?.length ?? 0) &&
    translateText(["addHolidayBtn"]);

  useEffect(() => {
    if (holidays?.pages) {
      const holidayDataItems = holidays?.pages
        ?.map((page: any) => page?.items)
        ?.flat();

      setHolidayDataItems(holidayDataItems);
      setIsConcatenationDone(true);
    } else if (isFetching && !isHolidayDataLoading) {
      setIsConcatenationDone(true);
    } else {
      setIsConcatenationDone(false);
    }
  }, [holidays, isHolidayDataLoading, isFetching, isFetchingNextPage]);

  return (
    <>
      <ContentLayout
        breadcrumbs={[
          {
            label: translateText(["dashboard.people"])
          },
          {
            label: translateText(["holidays.holidays"])
          }
        ]}
        title={translateText(["holidays.holidays"])}
        pageHead={translateText(["holidays.title"])}
        isDividerVisible={true}
        onPrimaryButtonClick={handleAddHoliday}
        primaryButtonText={isAdmin && primaryButtonText}
      >
        <HolidayDataTable
          holidaySelectedYear={selectedYear}
          setPopupTitle={() => setPopupTitle}
          holidayData={holidayDataItems}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isFetching={!isConcatenationDone}
        />
      </ContentLayout>
      <HolidayModalController />
    </>
  );
};

export default Holidays;
