import { ChangeEvent, useMemo } from "react";

import AvatarChip from "~community/common/components/molecules/AvatarChip/AvatarChip";
import RoundedSelect from "~community/common/components/molecules/RoundedSelect/RoundedSelect";
import Table from "~community/common/components/molecules/Table/Table";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import {
  getAdjacentYearsWithCurrent,
  isPastYear
} from "~community/common/utils/dateTimeUtils";
import { useGetAllLeaveEntitlements } from "~community/leave/api/LeaveEntitlementApi";
import { useGetLeaveTypes } from "~community/leave/api/LeaveTypesApi";
import { LeaveEntitlementModelTypes } from "~community/leave/enums/LeaveEntitlementEnums";
import { useLeaveStore } from "~community/leave/store/store";
import { LeaveEntitlementResponseType } from "~community/leave/types/LeaveEntitlementTypes";
import { exportLeaveBulkList } from "~community/leave/utils/leaveEntitlement/leaveEntitlementUtils";

interface Props {
  tableData: LeaveEntitlementResponseType | undefined;
  isFetching: boolean;
  searchTerm: string;
}

const LeaveEntitlementTable = ({
  tableData,
  isFetching,
  searchTerm
}: Props) => {
  const translateText = useTranslator("leaveModule", "leaveEntitlements");
  const translateAria = useTranslator(
    "leaveAria",
    "entitlement",
    "leaveEntitlementTable"
  );

  const {
    leaveEntitlementTableSelectedYear,
    setLeaveEntitlementTableSelectedYear,
    page,
    setPage,
    setLeaveEntitlementModalType
  } = useLeaveStore((state) => ({
    leaveEntitlementTableSelectedYear: state.leaveEntitlementTableSelectedYear,
    setLeaveEntitlementTableSelectedYear:
      state.setLeaveEntitlementTableSelectedYear,
    page: state.page,
    setPage: state.setPage,
    setLeaveEntitlementModalType: state.setLeaveEntitlementModalType
  }));
  const { data: leaveTypes } = useGetLeaveTypes();

  const {
    data: allLeaveEntitlements,
    isPending: isAllLeaveEntitlementsPending
  } = useGetAllLeaveEntitlements(leaveEntitlementTableSelectedYear);

  const activeLeaveTypes = useMemo(() => {
    if (!leaveTypes) return [];

    return leaveTypes?.filter((type) => type.isActive);
  }, [leaveTypes]);

  const headers = useMemo(() => {
    const baseColumns = [{ id: "name", label: translateText(["name"]) }];

    if (activeLeaveTypes === undefined || activeLeaveTypes.length === 0) {
      return baseColumns;
    }

    const columns = activeLeaveTypes?.map((leaveType) => ({
      id: leaveType?.name?.toLowerCase(),
      label: leaveType?.name?.toUpperCase()
    }));

    return [...baseColumns, ...columns];
  }, [activeLeaveTypes, translateText]);

  const rows = useMemo(() => {
    if (!tableData || !activeLeaveTypes) return [];

    return tableData.items.map((entitlement) => {
      const row: {
        id: number;
        name: JSX.Element;
        [key: string]: number | JSX.Element | string;
      } = {
        id: entitlement.employeeId,
        name: (
          <AvatarChip
            firstName={entitlement?.firstName}
            lastName={entitlement?.lastName}
            avatarUrl={entitlement?.authPic}
            isResponsiveLayout={true}
            chipStyles={{
              maxWidth: "100%",
              justifyContent: "flex-start"
            }}
            mediumScreenWidth={1024}
            smallScreenWidth={0}
          />
        )
      };

      activeLeaveTypes.forEach((leaveType) => {
        const columnKey = leaveType.name.toLowerCase();
        row[columnKey] = (
          <span aria-label="empty">
            <span aria-hidden={true}>-</span>
          </span>
        );
      });

      entitlement.entitlements.forEach((ent) => {
        const days = parseFloat(ent.totalDaysAllocated) || 0;
        const columnKey = ent.name.toLowerCase();

        if (Object.hasOwn(row, columnKey)) {
          row[columnKey] = (
            <span aria-label={`${days}`}>
              <span aria-hidden={true}>{days}</span>
            </span>
          );
        }
      });

      return row;
    });
  }, [tableData, activeLeaveTypes]);

  return (
    <Table
      tableName={`${TableNames.LEAVE_ENTITLEMENTS} ${leaveEntitlementTableSelectedYear}`}
      headers={headers}
      rows={rows}
      actionToolbar={{
        firstRow: {
          leftButton: (
            <RoundedSelect
              id="leave-entitlement-table-year-dropdown"
              value={leaveEntitlementTableSelectedYear}
              options={getAdjacentYearsWithCurrent()}
              onChange={(event) =>
                setLeaveEntitlementTableSelectedYear(event?.target.value)
              }
              accessibility={{
                label: translateAria(["select"])
              }}
            />
          )
        }
      }}
      tableBody={{
        emptyState: {
          isSearching: searchTerm.length !== 0,
          noData: {
            title: translateText(["emptyScreen", "title"], {
              selectedYear: leaveEntitlementTableSelectedYear
            }),
            description: translateText(["emptyScreen", "description"]),
            button: {
              label: !isPastYear(Number(leaveEntitlementTableSelectedYear))
                ? translateText(["emptyScreen", "buttonText"])
                : undefined,
              onClick: () => {
                setLeaveEntitlementModalType(
                  LeaveEntitlementModelTypes.DOWNLOAD_CSV
                );
              }
            }
          },
          noSearchResults: {
            title: translateText(["emptySearchResult", "title"]),
            description: translateText(["emptySearchResult", "description"])
          }
        },
        loadingState: {
          skeleton: {
            rows: 5
          }
        }
      }}
      tableFoot={{
        pagination: {
          isEnabled: tableData ? tableData.totalPages > 1 : false,
          currentPage: page,
          onChange: (_event: ChangeEvent<unknown>, value: number) => {
            setPage(value);
          },
          totalPages: tableData ? tableData.totalPages : 0
        },
        exportBtn: {
          isVisible: tableData ? tableData?.items?.length !== 0 : false,
          isLoading: isAllLeaveEntitlementsPending,
          label: translateText(["exportBtnTxt"]),
          disabled: tableData?.items?.length === 0,
          onClick: () => {
            exportLeaveBulkList(
              allLeaveEntitlements ?? [],
              leaveEntitlementTableSelectedYear
            );
          }
        }
      }}
      isLoading={isFetching}
    />
  );
};

export default LeaveEntitlementTable;
