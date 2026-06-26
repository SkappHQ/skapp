import React, { ChangeEvent, useMemo } from "react";

import Table from "~community/common/components/molecules/Table/Table";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useLeaveStore } from "~community/leave/store/store";
import { carryForwardTableDataType } from "~community/leave/types/LeaveCarryForwardTypes";
import { downloadCarryForwardDataCSV } from "~community/leave/utils/CarryForwardUtils";

interface Props {
  isRecordLoading?: boolean;
  rows: carryForwardTableDataType[];
  exportRows: carryForwardTableDataType[];
  headers: { label: string; id: number }[];
  totalPage: number;
}

const CarryForwardTable: React.FC<Props> = ({
  isRecordLoading,
  rows,
  exportRows,
  headers,
  totalPage
}) => {
  const translateTexts = useTranslator("leaveModule", "leaveCarryForward");

  const { carryForwardPagination, setCarryForwardPagination } = useLeaveStore(
    (state) => state
  );

  const formattedHeaders = useMemo(() => {
    const baseColumns = [{ id: "name", label: translateTexts(["name"]) }];

    return [...baseColumns, ...headers];
  }, [headers, translateTexts]);

  const fromattedRows = useMemo(() => {
    if (rows?.length === 0) return [];

    return rows;
  }, [rows]);

  return (
    <Table
      tableName={TableNames.CARRY_FORWARD_BALANCES}
      isLoading={isRecordLoading}
      headers={formattedHeaders}
      rows={fromattedRows}
      tableBody={{
        emptyState: {
          noData: {
            title: translateTexts(["noTimeEntryTitle"]),
            description: translateTexts(["noTimeEntryDes"])
          }
        }
      }}
      tableFoot={{
        pagination: {
          isEnabled: totalPage > 1,
          totalPages: totalPage,
          currentPage: carryForwardPagination.page,
          onChange: (_event: ChangeEvent<unknown>, value: number) =>
            setCarryForwardPagination(value - 1)
        },
        exportBtn: {
          isVisible: true,
          label: translateTexts(["exportBtnTxt"]),
          onClick: () => downloadCarryForwardDataCSV(exportRows, headers)
        }
      }}
    />
  );
};

export default CarryForwardTable;
