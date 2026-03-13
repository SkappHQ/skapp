import {
  BasicFilterStructure,
  SelectableItemList
} from "@rootcodelabs/skapp-ui";
import { JSX, useEffect, useState } from "react";

import { useTranslator } from "~community/common/hooks/useTranslator";
import { FilterButtonTypes } from "~community/common/types/CommonTypes";
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
    <BasicFilterStructure
      title={translateText(["filterTitle"])}
      resetButtonProps={{
        onClick: handleResetFilters,
        disabled: isResetDisabled,
        children: translateText(["resetButtonText"])
      }}
      applyButtonProps={{
        onClick: handleSubmit,
        children: translateText(["applyButtonText"])
      }}
    >
      <SelectableItemList
        title={menuItemsData[0].title}
        items={
          menuItemsData[0].buttons?.map((button) => ({
            label: button.text.toLowerCase(),
            value: button.text
          })) || []
        }
        selectedValues={filter.status}
        onChipClick={(statusText) => {
          const button = menuItemsData[0].buttons?.find(
            (b) => b.text === statusText
          );
          if (button) {
            handleFilters(button, menuItemsData[0].type);
          }
        }}
      />

      <SelectableItemList
        title={menuItemsData[1].title}
        items={leaveTypeButtons.map((button) => ({
          label: button.text,
          value: button.id?.toString() ?? ""
        }))}
        selectedValues={filter.type}
        onChipClick={(typeId) => {
          const button = leaveTypeButtons.find(
            (b) => b.id?.toString() === typeId
          );
          if (button) {
            handleFilters(button, menuItemsData[1].type);
          }
        }}
      />
    </BasicFilterStructure>
  );
};

export default RequestFilterMenuItems;
