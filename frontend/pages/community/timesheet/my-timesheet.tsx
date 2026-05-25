import { NextPage } from "next";

import EmployeeTimesheet from "~community/attendance/components/organisms/EmployeeTimesheet/EmployeeTimesheet";
import { EmployeeTimesheetModalTypes } from "~community/attendance/enums/timesheetEnums";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";

const MyTimeSheet: NextPage = () => {
  const translateText = useTranslator("attendanceModule");
  const { setIsEmployeeTimesheetModalOpen, setEmployeeTimesheetModalType } =
    useAttendanceStore((state) => state);

  return (
    <ContentLayout
      breadcrumbs={[
        {
          label: translateText(["dashboards.stepTimeSheet"])
        },
        {
          label: translateText(["timesheet.myTimesheet.title"])
        }
      ]}
      pageHead={translateText(["timesheet.myTimesheet.pageHead"])}
      title={translateText(["timesheet.myTimesheet.title"])}
      primaryButtonText={translateText(["timesheet.manualTimeEntryButtonTxt"])}
      primaryButtonType={ButtonStyle.PRIMARY}
      onPrimaryButtonClick={() => {
        setIsEmployeeTimesheetModalOpen(true);
        setEmployeeTimesheetModalType(
          EmployeeTimesheetModalTypes.ADD_TIME_ENTRY
        );
      }}
      isDividerVisible={true}
      dividerStyles={{ my: "1rem" }}
    >
      <EmployeeTimesheet />
    </ContentLayout>
  );
};

export default MyTimeSheet;
