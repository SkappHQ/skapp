import { Box, Divider, Stack, Typography } from "@mui/material";
import { JSX, useEffect, useState } from "react";

import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import { FilterChipType } from "~community/attendance/types/timeSheetTypes";
import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import {
  ButtonSizes,
  ButtonStyle
} from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";

import styles from "./styles";

interface Props {
  onApply: (
    selectedFilters: Record<string, string[]>,
    selectedFilterLabels: string[]
  ) => void;
  onReset: () => void;
  isManager?: boolean;
}

const TimesheetFilterModalBody = ({
  onApply,
  onReset,
  isManager = false
}: Props): JSX.Element => {
  const translateText = useTranslator("attendanceModule", "timesheet");
  const classes = styles();
  const {
    employeeTimesheetRequestsFilterValues,
    employeeSelectedTimesheetFilterLabels,
    employeeTimesheetRequestsFilters,
    timesheetRequestsFilterValues,
    timesheetRequestsFilters,
    selectedTimesheetFilterLabels
  } = useAttendanceStore((state) => state);

  const filterLabels = isManager
    ? selectedTimesheetFilterLabels
    : employeeSelectedTimesheetFilterLabels;
  const filterValues = isManager
    ? timesheetRequestsFilterValues
    : employeeTimesheetRequestsFilterValues;
  const filters = isManager
    ? timesheetRequestsFilters
    : employeeTimesheetRequestsFilters;

  const dataAttributeKey: string = "data-value";
  const [selectedFilterLabels, setSelectedFilterLabels] = useState<string[]>(
    []
  );
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});

  const onClickFilter = (category: string, filter: FilterChipType) => {
    const filterLabelIndex = selectedFilterLabels?.findIndex(
      (label) => label === filter?.label
    );
    const filterLabelCopy = [...selectedFilterLabels];
    if (filterLabelIndex < 0) {
      setSelectedFilterLabels([...selectedFilterLabels, filter?.label]);
    } else {
      filterLabelCopy.splice(filterLabelIndex, 1);
      setSelectedFilterLabels(filterLabelCopy);
    }

    const selectedFiltersCopy = { ...selectedFilters };
    if (
      selectedFiltersCopy?.[category] &&
      Array.isArray(selectedFiltersCopy?.[category])
    ) {
      const index = selectedFiltersCopy[category]?.indexOf(filter?.value);
      if (index !== -1) {
        selectedFiltersCopy[category]?.splice(index, 1);
      } else {
        selectedFiltersCopy[category]?.push(filter?.value);
      }
    } else {
      selectedFiltersCopy[category] = [filter?.value];
    }
    setSelectedFilters(selectedFiltersCopy);
  };

  useEffect(() => {
    if (filterLabels?.length > 0) {
      setSelectedFilterLabels(filterLabels);
    }
  }, [filterLabels]);

  useEffect(() => {
    if (Object.keys(filters)?.length > 0) {
      setSelectedFilters(filters);
    }
  }, [filters]);

  return (
    <Box>
      <Box>
        <Typography variant="h5" mb={"1.25rem"}>
          {translateText(["statusFilterTitle"])}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
          {filterValues?.status?.map((status: FilterChipType) => (
            <Button
              key={status?.value}
              isFullWidth={false}
              dataAttr={{ [dataAttributeKey]: status?.value }}
              label={status?.label}
              ariaLabel={`${status.label} filter`}
              buttonStyle={
                selectedFilterLabels.includes(status?.label)
                  ? ButtonStyle.SECONDARY
                  : ButtonStyle.TERTIARY
              }
              size={ButtonSizes.MEDIUM}
              onClick={() => onClickFilter("status", status)}
              startIcon={
                selectedFilterLabels.includes(status?.label) ? (
                  <Icon name={IconName.CHECK_CIRCLE_ICON} />
                ) : null
              }
              styles={classes.filterChipButtonStyles}
            />
          ))}
        </Box>
      </Box>
      <Divider aria-hidden={true} />
      <Stack direction="row" spacing="0.75rem" sx={classes.stackStyles}>
        <Button
          styles={classes.buttonStyles}
          label={translateText(["applyBtnTxt"])}
          buttonStyle={ButtonStyle.PRIMARY}
          onClick={() => onApply(selectedFilters, selectedFilterLabels)}
          ariaLabel="Apply filters"
        />
        <Button
          styles={classes.buttonStyles}
          label={translateText(["resetBtnTxt"])}
          buttonStyle={ButtonStyle.TERTIARY}
          onClick={onReset}
          disabled={selectedFilterLabels?.length === 0}
        />
      </Stack>
    </Box>
  );
};

export default TimesheetFilterModalBody;
