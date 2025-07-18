import {
  Box,
  Divider,
  Stack,
  Theme,
  Typography,
  useTheme
} from "@mui/material";
import { JSX, useEffect, useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import IconChip from "~community/common/components/atoms/Chips/IconChip.tsx/IconChip";
import Icon from "~community/common/components/atoms/Icon/Icon";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useMediaQuery } from "~community/common/hooks/useMediaQuery";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { FilterButtonTypes } from "~community/common/types/CommonTypes";
import { IconName } from "~community/common/types/IconTypes";
import { MenuitemsDataTypes } from "~community/common/types/filterTypes";
import { useLeaveStore } from "~community/leave/store/store";
import {
  LeaveRequestsFilterType,
  LeaveRequestsFilters,
  LeaveStatusTypes
} from "~community/leave/types/LeaveRequestTypes";
import { setLeaveRequestsParams } from "~community/leave/utils/LeaveRequestFilterActions";

interface Props {
  handleClose: () => void;
  leaveTypeButtons: FilterButtonTypes[];
  onReset?: (reset: boolean) => void;
  isManager?: boolean;
}

const RequestFilterMenuItems = ({
  handleClose,
  leaveTypeButtons,
  onReset,
  isManager
}: Props): JSX.Element => {
  const translateText = useTranslator(
    "leaveModule",
    "leaveRequests",
    "leaveRequestFilters"
  );
  const theme: Theme = useTheme();
  const translateAria = useTranslator("leaveAria", "myRequests");
  const queryMatches = useMediaQuery();
  const isSmallScreen = queryMatches(`(max-width: 1150px)`);

  const {
    resetLeaveRequestParams,
    leaveRequestsFilter,
    leaveRequestFilterOrder,
    setLeaveRequestFilterOrder,
    setLeaveRequestParams,
    setLeaveRequestsFilter
  } = useLeaveStore((state) => ({
    resetLeaveRequestParams: state.resetLeaveRequestParams,
    leaveRequestsFilter: state.leaveRequestsFilter,
    leaveRequestFilterOrder: state.leaveRequestFilterOrder,
    setLeaveRequestFilterOrder: state.setLeaveRequestFilterOrder,
    setLeaveRequestParams: state.setLeaveRequestParams,
    setLeaveRequestsFilter: state.setLeaveRequestsFilter,
    leaveRequestParams: state.leaveRequestParams
  }));

  const [menuItemsData, _] = useState<MenuitemsDataTypes[]>([
    {
      title: translateText(["leaveStatusTitle"]),
      type: translateText(["typeLeaveStatus"]),
      buttons: [
        {
          text: LeaveStatusTypes.PENDING.toUpperCase()
        },
        {
          text: LeaveStatusTypes.APPROVED.toUpperCase()
        },
        {
          text: LeaveStatusTypes.DENIED.toUpperCase()
        },
        {
          text: LeaveStatusTypes.CANCELLED.toUpperCase()
        },
        {
          text: LeaveStatusTypes.REVOKED.toUpperCase()
        }
      ]
    },
    {
      title: translateText(["leaveTypeTitle"]),
      type: translateText(["typeLeaveType"]),
      buttons: leaveTypeButtons
    }
  ]);
  const [optionOrder, setOptionOrder] = useState<string[]>([]);
  const [filter, setFilter] = useState<LeaveRequestsFilterType>({
    status: leaveRequestsFilter.status || [],
    type: leaveRequestsFilter.type || [],
    date: leaveRequestsFilter.date || ""
  });

  const isResetDisabled: boolean =
    filter.status.length === 0 &&
    filter.type.length === 0 &&
    filter.date === "";

  const handleFilters = (
    selectedButton: FilterButtonTypes,
    type: string
  ): void => {
    const filterValue =
      type === "type" ? selectedButton.id : selectedButton.text;

    if (
      !filter?.[type as LeaveRequestsFilters].includes(filterValue as string)
    ) {
      setFilter({
        ...filter,
        [type]: [
          ...(filter?.[type as keyof LeaveRequestsFilterType] || []),
          ...[filterValue]
        ]
      });
      setOptionOrder([
        ...optionOrder.filter(
          (item) => item !== filter?.[type as keyof LeaveRequestsFilterType]
        ),
        selectedButton.text as string
      ]);
    } else {
      const currentFilter = filter?.[type as keyof LeaveRequestsFilterType];
      const updatedFilters = Array.isArray(currentFilter)
        ? currentFilter.filter((filterItem) => filterItem !== filterValue)
        : [];
      setFilter({
        ...filter,
        [type]: updatedFilters
      });
      const valueToRemove = type === "type" ? selectedButton.text : filterValue;
      const updatedList = optionOrder.filter((item) => item !== valueToRemove);
      setOptionOrder(updatedList);
    }
  };

  const handleResetFilters = (): void => {
    setFilter({
      status: [],
      type: [],
      date: ""
    });

    if (isManager) {
      onReset?.(true);
    }

    resetLeaveRequestParams();
    handleClose();
    setOptionOrder([]);
  };

  const handleSubmit = (): void => {
    setLeaveRequestsFilter("status", filter.status);
    setLeaveRequestsFilter("type", filter.type);
    setLeaveRequestsFilter("date", filter.date);
    setLeaveRequestFilterOrder(optionOrder);
    setLeaveRequestsParams(filter, setLeaveRequestParams);
    handleClose();
  };

  useEffect(() => {
    setOptionOrder(leaveRequestFilterOrder);
  }, [leaveRequestFilterOrder, setOptionOrder]);

  useEffect(() => {
    setFilter({
      status: leaveRequestsFilter.status || [],
      type: leaveRequestsFilter.type || [],
      date: leaveRequestsFilter.date || ""
    });
  }, [leaveRequestsFilter]);

  return (
    <Box sx={{ p: "0.75rem", backgroundColor: "common.white" }}>
      <Box>
        {menuItemsData.map((item: MenuitemsDataTypes, index: number) => (
          <Box
            key={index}
            component="div"
            role="region"
            aria-label={
              item.type === "type"
                ? translateAria(["myLeaveRequests", "typeFilterSection"])
                : translateAria(["myLeaveRequests", "statusFilterSection"])
            }
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {item.title}
            </Typography>
            <Stack
              direction="row"
              columnGap={0.5}
              rowGap={2.5}
              flexWrap="wrap"
              sx={{
                py: "1.25rem",
                [theme.breakpoints.between("lg", "xl")]: {
                  maxWidth: "35.625rem"
                },
                pointerEvents: "auto"
              }}
            >
              {item.buttons?.map((button, index) => {
                return (
                  <IconChip
                    key={index}
                    label={
                      item.type !== "type"
                        ? button.text.toLowerCase()
                        : button.text
                    }
                    onClick={() => handleFilters(button, item.type)}
                    icon={
                      filter?.status?.includes(button.text) ||
                      filter?.type.includes(
                        button.id ? button.id.toString() : ""
                      ) ? (
                        <Icon
                          name={IconName.SELECTED_ICON}
                          fill={theme.palette.primary.dark}
                        />
                      ) : undefined
                    }
                    chipStyles={{
                      backgroundColor:
                        filter?.[item.type as "status" | "date"].includes(
                          button.text
                        ) ||
                        filter?.type.includes(
                          button.id ? button.id.toString() : ""
                        )
                          ? theme.palette.secondary.main
                          : theme.palette.grey[100],
                      color:
                        filter?.[item.type as "status" | "date"].includes(
                          button.text
                        ) ||
                        filter?.type.includes(
                          button.id ? button.id.toString() : ""
                        )
                          ? theme.palette.primary.dark
                          : "black",
                      padding: "8px 12px",
                      fontSize: isSmallScreen ? "0.75rem" : "0.875rem"
                    }}
                    accessibility={{
                      ariaLabel:
                        filter?.status?.includes(button.text) ||
                        filter?.type.includes(
                          button.id ? button.id.toString() : ""
                        )
                          ? translateAria(
                              ["myLeaveRequests", "filterSelected"],
                              {
                                filterName: button.text
                              }
                            )
                          : translateAria(["myLeaveRequests", "filterOption"], {
                              filterName: button.text
                            })
                    }}
                  />
                );
              })}
            </Stack>
          </Box>
        ))}
        <Divider />
        <Stack direction="row" spacing="0.75rem" sx={{ pt: "0.75rem" }}>
          <Button
            styles={{
              py: "0.75rem",
              px: "1.25rem",
              fontSize: "1rem",
              fontWeight: "400"
            }}
            label={translateText(["applyButtonText"])}
            buttonStyle={ButtonStyle.PRIMARY}
            onClick={handleSubmit}
            ariaLabel="Apply filters"
          />
          <Button
            styles={{
              py: "0.75rem",
              px: "1.25rem"
            }}
            label={translateText(["resetButtonText"])}
            buttonStyle={ButtonStyle.TERTIARY}
            onClick={handleResetFilters}
            disabled={isResetDisabled}
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default RequestFilterMenuItems;
