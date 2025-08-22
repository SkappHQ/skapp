package com.skapp.community.leaveplanner.repository;

import com.skapp.community.common.model.User;
import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.community.leaveplanner.payload.EmployeeLeaveHistoryFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveRequestFilterDto;
import com.skapp.community.leaveplanner.payload.TeamLeaveHistoryFilterDto;
import com.skapp.community.leaveplanner.payload.request.EmployeesOnLeavePeriodFilterDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeLeaveRequestReportExportDto;
import com.skapp.community.leaveplanner.payload.response.EmployeeLeaveRequestReportQueryDto;
import com.skapp.community.leaveplanner.repository.projection.LeaveTrendByDay;
import com.skapp.community.leaveplanner.repository.projection.LeaveTrendByMonth;
import com.skapp.community.leaveplanner.repository.projection.LeaveTypeBreakDown;
import com.skapp.community.leaveplanner.repository.projection.LeaveUtilizationByEmployeeMonthly;
import com.skapp.community.leaveplanner.repository.projection.ManagerLeaveTrend;
import com.skapp.community.leaveplanner.repository.projection.OrganizationLeaveTrendForTheYear;
import com.skapp.community.leaveplanner.repository.projection.TeamLeaveCountByType;
import com.skapp.community.leaveplanner.repository.projection.TeamLeaveTrendForTheYear;
import com.skapp.community.timeplanner.model.TimeConfig;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LeaveRequestRepository {

	List<LeaveRequest> findLeaveRequestsByDateRange(LeaveRequestFilterDto leaveRequestFilterDto, Long employeeId);

	List<LeaveRequest> findAllLeaveRequestsByDateRange(LeaveRequestFilterDto leaveRequestFilterDto);

	List<LeaveRequest> findLeaveRequestsForTodayByUser(LocalDate currentDate, Long employeeId);

	List<LeaveRequest> findLeaveRequestAvailabilityForGivenDate(LocalDate date, Long employeeId);

	List<LeaveRequest> findLeaveRequestsByDateRangeAndEmployees(LeaveRequestFilterDto leaveRequestFilterDto,
			List<Long> employeeIds);

	List<LeaveRequest> getLeaveRequestsByTeamId(EmployeesOnLeavePeriodFilterDto leaveRequestFilterDto);

	Float findAllEmployeeAnnualDaysByDateRangeQuery(Long typeId, LocalDate firstDateOfYear, LocalDate currentDate);

	Page<LeaveRequest> getLeaveRequestHistoryByTeam(Long id, TeamLeaveHistoryFilterDto teamLeaveHistoryFilterDto,
			Pageable pageable);

	Page<LeaveRequest> findAllLeaveRequestsByEmployeeId(@NonNull Long id,
			EmployeeLeaveHistoryFilterDto employeeLeaveHistoryFilterDto, Pageable pageable);

	List<LeaveRequest> findAllFutureLeaveRequestsForTheDay(DayOfWeek day);

	Optional<LeaveRequest> findAuthLeaveRequestById(Long id, User user, Boolean isManager);

	Page<LeaveRequest> findAllRequestsByEmployee(Long employeeId, LeaveRequestFilterDto leaveRequestFilterDto,
			Pageable page);

	LeaveRequest findByEmployeeAndDate(Long employeeId, LocalDate date);

	Page<LeaveRequest> findAllLeaveRequests(Long managerEmployeeId, LeaveRequestFilterDto leaveRequestFilterDto,
			Pageable page);

	Page<LeaveRequest> findAllRequestAssignedToManager(Long employeeId, LeaveRequestFilterDto leaveRequestFilterDto,
			Pageable pageable);

	List<LeaveRequest> findPendingLeaveRequestsByManager(Long employeeId, String searchKeyword);

	List<LeaveRequest> getEmployeesOnLeaveByTeamAndDate(List<Long> teams, LocalDate current, Long currentUserId,
			boolean isLeaveAdmin);

	List<EmployeeLeaveRequestReportExportDto> generateLeaveRequestDetailedReport(List<Long> leaveTypeIds,
			LocalDate startDate, LocalDate endDate, Long jobFamilyId, Long teamId, List<String> statuses);

	Page<EmployeeLeaveRequestReportQueryDto> generateLeaveRequestDetailedReportWithPagination(List<Long> leaveTypeIds,
			LocalDate startDate, LocalDate endDate, Long jobFamilyId, Long teamId, List<String> statuses,
			Pageable pageable);

	Float findAllEmployeeRequestsByWithinThirtyDays(LocalDate startDate, LocalDate endDate,

			List<TimeConfig> timeConfigs, List<LocalDate> holidayDates, List<Long> teamIds,
			String organizationTimeZone);

	List<LeaveTrendByDay> findLeaveTrendAwayByDay(LocalDate startDate, LocalDate endDate,
			List<Integer> workingDaysIndex, List<LocalDate> holidayDates);

	List<LeaveTrendByMonth> findLeaveTrendAwayByMonth(LocalDate startDate, LocalDate endDate,
			List<Integer> workingDaysIndex, List<LocalDate> holidayDates);

	List<LeaveTypeBreakDown> findLeaveTypeBreakDown(List<Integer> workingDaysIndex, List<LocalDate> holidayDates,
			LocalDate startDate, LocalDate endDate, List<Long> typeIds, List<Long> teamIds);

	List<LeaveUtilizationByEmployeeMonthly> findLeaveUtilizationByEmployeeMonthly(LocalDate startDate,
			LocalDate endDate, List<Integer> workingDaysIndex, List<LocalDate> holidayDates, Long employeeId,
			List<Long> typeIds);

	List<OrganizationLeaveTrendForTheYear> findOrganizationLeaveTrendForTheYear(List<Integer> workingDaysIndex,
			List<LocalDate> holidayDates, List<Long> leaveTypeIds, LocalDate startDate, LocalDate endDate);

	List<TeamLeaveTrendForTheYear> findTeamLeaveTrendForTheYear(Long teamId, List<Integer> workingDays,
			List<LocalDate> holidayDates, List<Long> leaveTypeIds, LocalDate startDate, LocalDate endDate);

	List<ManagerLeaveTrend> findLeaveTrendForTheManager(List<Long> teamIds, List<Integer> workingDays,
			List<LocalDate> holidayDates, List<Long> leaveTypeIds, LocalDate startDate, LocalDate endDate,
			List<Long> employeeIds);

	Float findAllEmployeeRequestsByDateRangeQuery(LocalDate startDate, LocalDate endDate,
			List<Integer> workingDaysIndex, List<LocalDate> holidayDates);

	List<TeamLeaveCountByType> findTeamLeaveCountByType(Long teamId, List<Integer> workingDays,
			List<LocalDate> holidayDates, LocalDate startDate, LocalDate endDate);

}
