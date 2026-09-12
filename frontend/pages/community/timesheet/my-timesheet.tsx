import { NextPage } from "next";
import { useShallow } from "zustand/react/shallow";

import TimeZoneNotice from "~community/attendance/components/molecules/TimeZoneNotice/TimeZoneNotice";
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
    setDirectManualTimeEntryEligibleEmployee
  } = useAttendanceStore(
    useShallow((state) => ({
      setIsEmployeeTimesheetModalOpen: state.setIsEmployeeTimesheetModalOpen,
      setEmployeeTimesheetModalType: state.setEmployeeTimesheetModalType,
      setDirectManualTimeEntryEligibleEmployee:
        state.setDirectManualTimeEntryEligibleEmployee
    }))
  );
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
        !isManualEntryRestricted
          ? translateText(["timesheet.manualTimeEntryButtonTxt"])
          : undefined
      }
      primaryButtonType={ButtonStyle.PRIMARY}
      isPrimaryBtnDisabled={isRestrictionLoading}
      onPrimaryButtonClick={() => {
        setDirectManualTimeEntryEligibleEmployee(null);
        setIsEmployeeTimesheetModalOpen(true);
        setEmployeeTimesheetModalType(
          EmployeeTimesheetModalTypes.ADD_TIME_ENTRY
        );
      }}
      isDividerVisible={true}
      dividerStyles={{ my: "1rem" }}
    >
      <>
        <TimeZoneNotice />
        <EmployeeTimesheet />
      </>
    </ContentLayout>
  );
};

export default MyTimeSheet;
