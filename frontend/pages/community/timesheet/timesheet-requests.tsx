import { NextPage } from "next";
import { useRouter } from "next/navigation";

import { useGetManagerTimeSheetRequests } from "~community/attendance/api/attendanceManagerApi";
import ManagerTimesheetRequestTable from "~community/attendance/components/molecules/ManagerTimesheetRequestTable/ManagerTimesheetRequestTable";
import useApproveDenyTimeRequest from "~community/attendance/hooks/useApproveDenyTimeRequest";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";

const TimesheetRequestsPage: NextPage = () => {
  const translateText = useTranslator("attendanceModule", "timesheet");

  const { approveTimesheetRequest, declineTimesheetRequest } =
    useApproveDenyTimeRequest();

  const router = useRouter();

  const { data: timeConfigData } = useDefaultCapacity();

  const { data: requestData, isLoading: isRequestLoading } =
    useGetManagerTimeSheetRequests();
  return (
    <ContentLayout
      pageHead={translateText(["timeEntryRequests.pageHead"])}
      title={translateText(["timeEntryRequests.title"])}
      isDividerVisible={true}
      isBackButtonVisible={true}
      onBackClick={router.back}
    >
      <ManagerTimesheetRequestTable
        tableName={TableNames.TIME_ENTRY_REQUEST}
        requestData={requestData}
        isRequestLoading={isRequestLoading}
        totalHours={timeConfigData?.[0]?.totalHours}
        hasFullList={true}
        approveTimesheetRequest={approveTimesheetRequest}
        declineTimesheetRequest={declineTimesheetRequest}
      />
    </ContentLayout>
  );
};

export default TimesheetRequestsPage;
