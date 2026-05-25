import { NextPage } from "next";
import { useRouter } from "next/navigation";

import { useGetManagerTimeSheetRequests } from "~community/attendance/api/attendanceManagerApi";
import ManagerTimesheetRequestTable from "~community/attendance/components/molecules/ManagerTimesheetRequestTable/ManagerTimesheetRequestTable";
import useApproveDenyTimeRequest from "~community/attendance/hooks/useApproveDenyTimeRequest";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import ROUTES from "~community/common/constants/routes";
import { TableNames } from "~community/common/enums/Table";
import { useTranslator } from "~community/common/hooks/useTranslator";
import { useDefaultCapacity } from "~community/configurations/api/timeConfigurationApi";

const TimesheetRequestsPage: NextPage = () => {
  const translateText = useTranslator("attendanceModule");

  const { approveTimesheetRequest, declineTimesheetRequest } =
    useApproveDenyTimeRequest();

  const router = useRouter();

  const { data: timeConfigData } = useDefaultCapacity();

  const { data: requestData, isLoading: isRequestLoading } =
    useGetManagerTimeSheetRequests();
  return (
    <ContentLayout
      breadcrumbs={[
        {
          label: translateText(["dashboards.stepTimeSheet"])
        },
        {
          label: translateText(["timesheet.allTimesheets.title"]),
          href: ROUTES.TIMESHEET.ALL_TIMESHEETS
        },
        {
          label: translateText(["timesheet.timeEntryRequests.title"])
        }
      ]}
      pageHead={translateText(["timesheet.timeEntryRequests.pageHead"])}
      title={translateText(["timesheet.timeEntryRequests.title"])}
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
