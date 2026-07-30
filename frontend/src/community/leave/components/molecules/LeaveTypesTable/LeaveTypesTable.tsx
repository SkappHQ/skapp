import { EditIcon, IconButton } from "@rootcodelabs/skapp-ui";
import { useRouter } from "next/router";
import { useEffect } from "react";

import TableView from "~community/common/components/organisms/TableView/TableView";
import type {
  GridHeader,
  GridRow
} from "~community/common/components/organisms/TableView/types";
import ROUTES from "~community/common/constants/routes";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { getEmoji } from "~community/common/utils/commonUtil";
import { useGetLeaveTypes } from "~community/leave/api/LeaveTypesApi";
import { LeaveTypeFormTypes } from "~community/leave/enums/LeaveTypeEnums";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveTypeType } from "~community/leave/types/AddLeaveTypes";
import { getLeaveTypeDurationTableContent } from "~community/leave/utils/leaveTypes/LeaveTypeUtils";

const chipClassName =
  "inline-flex w-fit items-center gap-2 rounded-full bg-tertiary-background px-4 py-2";

const LeaveTypesTable = () => {
  const translateText = useTranslator("leaveModule", "leaveTypes");

  const router = useRouter();

  const { setEditingLeaveType, setAllLeaveTypes } = useLeaveStore();

  const { data: leaveTypes, isFetching: isLeaveTypesFetching } =
    useGetLeaveTypes();

  const columns = [
    { field: "leaveTypeName", headerName: translateText(["nameHeader"]) },
    { field: "durations", headerName: translateText(["durationsHeader"]) },
    {
      field: "carriedForward",
      headerName: translateText(["carriedForwardHeader"])
    }
  ];

  const tableHeaders: GridHeader[] = [
    ...columns.map((col) => ({
      id: col.field,
      label: col.headerName
    })),
    {
      id: "actions",
      label: translateText(["actionsHeader"]),
      width: "6rem",
      align: "right"
    }
  ];

  const handleEditLeaveType = (leaveType: LeaveTypeType) => (): void => {
    setEditingLeaveType(leaveType);
    router.push(ROUTES.LEAVE.ADD_EDIT_LEAVE_TYPES(LeaveTypeFormTypes.EDIT));
  };

  const transformToTableRows = (): GridRow[] => {
    return ((leaveTypes as LeaveTypeType[]) ?? []).map(
      (leaveType: LeaveTypeType) => ({
        id: leaveType?.typeId,
        leaveTypeName: (
          <div className={chipClassName}>
            <span role="img" aria-hidden="true">
              {getEmoji(leaveType?.emojiCode || "")}
            </span>
            {leaveType?.name}
          </div>
        ),
        durations: (
          <div className="flex flex-row flex-wrap items-center gap-2">
            {getLeaveTypeDurationTableContent(leaveType?.leaveDuration).map(
              (duration: string) => (
                <div key={duration} className={chipClassName}>
                  {duration}
                </div>
              )
            )}
          </div>
        ),
        carriedForward: (
          <div className={chipClassName}>
            {leaveType?.isCarryForwardEnabled
              ? translateText(["enabled"])
              : translateText(["disabled"])}
          </div>
        ),
        actions: (
          <IconButton
            icon={<EditIcon />}
            onClick={handleEditLeaveType(leaveType)}
            aria-label={translateText(["editButton.label"], {
              recordName: leaveType?.name
            })}
          />
        )
      })
    );
  };

  useEffect(() => {
    setAllLeaveTypes(leaveTypes ?? []);
  }, [leaveTypes, setAllLeaveTypes]);

  return (
    <TableView
      className="body2"
      tableName={TableNames.LEAVE_TYPES}
      headers={tableHeaders}
      rows={transformToTableRows()}
      isLoading={isLeaveTypesFetching}
      skeletonRows={6}
      height="27.5rem"
    />
  );
};

export default LeaveTypesTable;
