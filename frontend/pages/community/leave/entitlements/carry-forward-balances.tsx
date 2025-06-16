import { Box } from "@mui/material";
import { type NextPage } from "next";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import Button from "~community/common/components/atoms/Button/Button";
import Icon from "~community/common/components/atoms/Icon/Icon";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import useBlockPageReload from "~community/common/hooks/useBlockPageReload/useBlockPageReload";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { IconName } from "~community/common/types/IconTypes";
import { useGetUseCarryForwardLeaveEntitlements } from "~community/leave/api/LeaveApi";
import CarryForwardTable from "~community/leave/components/molecules/CarryForwardTable/CarryForwardTable";
import LeaveCarryForwardModalController from "~community/leave/components/organisms/LeaveCarryForwardModalController/LeaveCarryForwardModalController";
import { useLeaveStore } from "~community/leave/store/store";
import {
  LeaveCarryForwardModalTypes,
  carryForwardEntitlementType,
  carryForwardLeaveEntitlementsType
} from "~community/leave/types/LeaveCarryForwardTypes";
import useGoogleAnalyticsEvent from "~enterprise/common/hooks/useGoogleAnalyticsEvent";
import { GoogleAnalyticsTypes } from "~enterprise/common/types/GoogleAnalyticsTypes";

const CarryForwardBalances: NextPage = () => {
  const router = useRouter();

  const translateText = useTranslator("leaveModule", "leaveCarryForward");

  useBlockPageReload();

  const {
    leaveCarryForwardSyncBtnStatus,
    carryForwardLeaveTypes,
    leaveCarryForwardId,
    setIsLeaveCarryForwardModalOpen,
    setLeaveCarryForwardModalType
  } = useLeaveStore((state) => ({
    leaveCarryForwardSyncBtnStatus: state.leaveCarryForwardSyncBtnStatus,
    carryForwardLeaveTypes: state.carryForwardLeaveTypes,
    leaveCarryForwardId: state.leaveCarryForwardId,
    setIsLeaveCarryForwardModalOpen: state.setIsLeaveCarryForwardModalOpen,
    setLeaveCarryForwardModalType: state.setLeaveCarryForwardModalType
  }));

  const [checkedList] = useState<number[]>(leaveCarryForwardId);

  const { data: carryForwardEntitlement } =
    useGetUseCarryForwardLeaveEntitlements(checkedList);

  const headers = useMemo(() => {
    if (carryForwardLeaveTypes.length > 0) {
      return carryForwardLeaveTypes.map((leaveType) => ({
        label: leaveType.name,
        id: leaveType.typeId
      }));
    }

    return [];
  }, []);

  const rows = useMemo(() => {
    const carryForwardEntitlementItems = carryForwardEntitlement?.items;
    if (
      carryForwardEntitlementItems !== undefined &&
      carryForwardEntitlementItems.length > 0
    ) {
      return carryForwardEntitlementItems.map(
        (entitlement: carryForwardLeaveEntitlementsType) => {
          const tableData: Array<Record<string, string | number>> = [];

          const tableRow: Record<string, string | number> = {
            employeeId: entitlement.employee.employeeId,
            name:
              entitlement.employee.firstName +
              " " +
              entitlement.employee.lastName
          };

          headers.forEach((header) => {
            const leaveType = entitlement.entitlements.find(
              (entitlement: carryForwardEntitlementType) =>
                entitlement.leaveTypeId === header.id
            );
            tableRow[header.id] = leaveType
              ? leaveType.carryForwardAmount
              : "-";
          });

          tableData.push(tableRow);

          return tableData;
        }
      );
    }

    return [];
  }, [carryForwardEntitlement, headers]);

  const handleSync = () => {
    setIsLeaveCarryForwardModalOpen(true);
    setLeaveCarryForwardModalType(
      LeaveCarryForwardModalTypes.CARRY_FORWARD_CONFIRM_SYNCHRONIZATION
    );
  };

  useGoogleAnalyticsEvent({
    onMountEventType:
      GoogleAnalyticsTypes.GA4_LEAVE_CARRY_FORWARD_BALANCE_VIEWED,
    triggerOnMount: true
  });

  return (
    <>
      <ContentLayout
        pageHead={translateText(["carryForwardingBalance.pageHead"])}
        title={translateText(["carryForwardingBalance.title"])}
        isDividerVisible={true}
        isBackButtonVisible
        onBackClick={() => router.push(ROUTES.LEAVE.LEAVE_ENTITLEMENTS)}
      >
        <>
          <CarryForwardTable
            headers={headers}
            rows={rows[0]}
            totalPage={carryForwardEntitlement?.totalPages}
          />
          <Box
            sx={{
              marginTop: "1.5rem",
              width: "full",
              flexDirection: "row",
              display: "flex",
              justifyContent: "flex-end"
            }}
          >
            <Button
              styles={{
                width: "fit-content",
                paddingY: "1.25rem",
                paddingX: "2.5rem",
                fontSize: "1rem"
              }}
              label={
                translateText(["leaveCarryForwardBallancePageSyncButton"]) ?? ""
              }
              endIcon={<Icon name={IconName.RIGHT_ARROW_ICON} />}
              isFullWidth={false}
              disabled={leaveCarryForwardSyncBtnStatus.isDisabled}
              isLoading={leaveCarryForwardSyncBtnStatus.isLoading}
              onClick={handleSync}
            />
          </Box>
          <LeaveCarryForwardModalController />
        </>
      </ContentLayout>
    </>
  );
};

export default CarryForwardBalances;
