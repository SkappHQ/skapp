import { NextPage } from "next";

import EmployeeTimesheet from "~community/attendance/components/organisms/EmployeeTimesheet/EmployeeTimesheet";
import { EmployeeTimesheetModalTypes } from "~community/attendance/enums/timesheetEnums";
import useManualEntryRestriction from "~community/attendance/hooks/useManualEntryRestriction";
import { useAttendanceStore } from "~community/attendance/store/attendanceStore";
import ContentLayout from "~community/common/components/templates/ContentLayout/ContentLayout";
import { ButtonStyle } from "~community/common/enums/ComponentEnums";
import { useTranslator } from "~community/common/hooks/useTranslator";

const MyTimeSheet: NextPage = () => {
  const translateText = useTranslator("attendanceModule");
  const {
    setIsEmployeeTimesheetModalOpen,
    setEmployeeTimesheetModalType,
    setDirectEntryEmployee
  } = useAttendanceStore((state) => state);
  const { isManualEntryRestricted, isLoading: isRestrictionLoading } =
    useManualEntryRestriction();

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
      primaryButtonText={
        isManualEntryRestricted
          ? translateText(["timesheet.manualTimeEntryButtonTxt"])
          : undefined
      }
      primaryButtonType={ButtonStyle.PRIMARY}
      isPrimaryBtnDisabled={isRestrictionLoading}
      onPrimaryButtonClick={() => {
        setDirectEntryEmployee(null);
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
