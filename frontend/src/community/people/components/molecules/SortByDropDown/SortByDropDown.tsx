import { SelectChangeEvent, Stack, Typography } from "@mui/material";
import { MutableRefObject, useEffect, useMemo } from "react";

import { useGetAllWorkLocations } from "~community/common/api/WorkLocationApi";
import RoundedSelect from "~community/common/components/molecules/RoundedSelect/RoundedSelect";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { SortOrderTypes } from "~community/common/types/CommonTypes";
import {
  currentYear,
  getCurrentAndNextYear
} from "~community/common/utils/dateTimeUtils";
import { usePeopleStore } from "~community/people/store/store";
import { holiday } from "~community/people/types/HolidayTypes";
import { buildWorkLocationOptions } from "~community/people/utils/holidayUtils/commonUtils";

import { styles } from "./styles";

interface Props {
  holidayData: holiday[] | undefined;
  listInnerRef: MutableRefObject<HTMLDivElement | undefined>;
}

const SortByDropDown = ({ holidayData, listInnerRef }: Props) => {
  const translateText = useTranslator("peopleModule", "holidays");
  const translateAria = useTranslator(
    "peopleAria",
    "holiday",
    "sortByDropdown"
  );
  const classes = styles();

  const {
    selectedYear,
    setSelectedYear,
    holidayDataSort,
    selectedWorkLocationId,
    setSelectedWorkLocationId
  } = usePeopleStore((state) => ({
    selectedYear: state.selectedYear,
    setSelectedYear: state.setSelectedYear,
    holidayDataSort: state.holidayDataParams.sortOrder,
    selectedWorkLocationId: state.selectedWorkLocationId,
    setSelectedWorkLocationId: state.setSelectedWorkLocationId
  }));

  const { data: workLocations } = useGetAllWorkLocations();

  const workLocationOptions = useMemo(
    () =>
      buildWorkLocationOptions(workLocations, translateText(["allLocations"])),
    [workLocations, translateText]
  );

  const selectedWorkLocationLabel = useMemo(() => {
    const found = workLocationOptions.find(
      (opt) => opt.value === String(selectedWorkLocationId)
    );
    return found?.label ?? translateText(["allLocations"]);
  }, [workLocationOptions, selectedWorkLocationId, translateText]);

  useEffect(() => {
    setSelectedYear(currentYear.toString());
  }, [currentYear]);

  const scrollToTop = () => {
    if (listInnerRef.current) {
      listInnerRef.current.scrollTop = 0;
    }
  };

  const handleHolidayDataSort = usePeopleStore(
    (state) => state.handleHolidayDataSort
  );

  const dropdownItems = [
    {
      label: `${translateText(["chronologically"])} ${translateText(["janToDec"])}`,
      value: SortOrderTypes.ASC,
      ariaLabel: `${translateAria(["chronologically"])} ${translateAria(["janToDec"])}`
    },
    {
      label: `${translateText(["chronologically"])} ${translateText(["decToJan"])}`,
      value: SortOrderTypes.DESC,
      ariaLabel: `${translateAria(["chronologically"])} ${translateAria(["decToJan"])}`
    }
  ];

  const handleItemClick = (event: SelectChangeEvent) => {
    handleHolidayDataSort("sortOrder", event.target.value);
    scrollToTop();
  };

  const selectedItem = dropdownItems.find(
    (item) => item.value === holidayDataSort
  );

  return (
    <Stack sx={classes.wrapper}>
      <RoundedSelect
        id="holiday-table-sort"
        onChange={handleItemClick}
        value={selectedItem?.value ?? ""}
        options={dropdownItems}
        renderValue={(selectedValue: string) => {
          return (
            <Typography
              aria-label={`${translateAria(["currentSelection"])} ${
                selectedValue === SortOrderTypes.ASC
                  ? translateAria(["janToDec"])
                  : translateAria(["decToJan"])
              }`}
            >
              {translateText(["sort"])}
              {selectedValue === SortOrderTypes.ASC
                ? translateText(["janToDec"])
                : translateText(["decToJan"])}
            </Typography>
          );
        }}
        accessibility={{
          label: translateAria(["sort"])
        }}
        disabled={holidayData?.length === 0}
      />
      <RoundedSelect
        id="holiday-year-sort"
        value={selectedYear}
        options={getCurrentAndNextYear()}
        onChange={(event) => setSelectedYear(event?.target.value)}
        renderValue={(selectedValue: string) => {
          return (
            <Typography
              aria-label={`${translateAria(["currentSelection"])} ${selectedValue}`}
            >
              {selectedValue}
            </Typography>
          );
        }}
        accessibility={{
          label: translateAria(["yearSelector"])
        }}
      />
      <RoundedSelect
        id="holiday-work-location-sort"
        value={String(selectedWorkLocationId)}
        options={workLocationOptions}
        onChange={(event) => {
          setSelectedWorkLocationId(Number(event.target.value));
          scrollToTop();
        }}
        renderValue={() => {
          return (
            <Typography
              aria-label={`${translateAria(["currentSelection"])} ${selectedWorkLocationLabel}`}
            >
              {selectedWorkLocationLabel}
            </Typography>
          );
        }}
        accessibility={{
          label: translateAria(["workLocationSelector"])
        }}
        customStyles={{
          menuProps: {
            paperProps: {
              sx: {
                sx: {
                  borderRadius: "0.75rem",
                  maxHeight: "12rem",
                  overflowY: "auto"
                }
              }
            }
          }
        }}
      />
    </Stack>
  );
};

export default SortByDropDown;
