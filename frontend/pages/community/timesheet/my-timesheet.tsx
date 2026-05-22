import { NextPage } from "next";

import EmployeeTimesheet from "~community/attendance/components/organisms/EmployeeTimesheet/EmployeeTimesheet";
import { EmployeeTimesheetModalTypes } from "~community/attendance/enums/timesheetEnums";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import useBreadcrumbs from "~community/common/hooks/useBreadcrumbs";
import { useTranslator } from "~community/common/hooks/useTranslator";

const MyTimeSheet: NextPage = () => {
  useBreadcrumbs([
    {
      label: "timesheet"
    },
    {
      label: "myTimesheet"
    }
  ]);
  const translateText = useTranslator("attendanceModule", "timesheet");
  const { setIsEmployeeTimesheetModalOpen, setEmployeeTimesheetModalType } =
    useAttendanceStore((state) => state);

  return (
    <ContentLayout
      pageHead={translateText(["myTimesheet.pageHead"])}
      title={translateText(["myTimesheet.title"])}
      primaryButtonText={translateText(["manualTimeEntryButtonTxt"])}
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
