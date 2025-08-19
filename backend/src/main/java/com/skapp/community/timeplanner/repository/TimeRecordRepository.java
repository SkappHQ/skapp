package com.skapp.community.timeplanner.repository;

import com.skapp.community.timeplanner.model.TimeRecord;
import com.skapp.community.timeplanner.payload.projection.EmployeeWorkHours;
import com.skapp.community.timeplanner.payload.projection.TimeRecordTrendDto;
import com.skapp.community.timeplanner.payload.projection.TimeRecordsByEmployeesDto;
import com.skapp.community.timeplanner.payload.request.AttendanceSummaryDto;
import com.skapp.community.timeplanner.payload.response.TimeSheetSummaryData;
import com.skapp.community.timeplanner.repository.projection.EmployeeTimeRecord;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;
import java.util.Optional;

public interface TimeRecordRepository {

	AttendanceSummaryDto getEmployeeAttendanceSummary(List<Long> employeeIds, LocalDate startDate, LocalDate endDate);

	Optional<TimeRecord> findIncompleteClockoutTimeRecords(LocalDate lastClockInDate, Long employeeId);

	AttendanceSummaryDto findManagerAssignUsersAttendanceSummary(Long managerId, List<Long> teamIds,
			LocalDate startDate, LocalDate endDate, List<Long> employeeIds);

	TimeSheetSummaryData findTimeSheetSummaryData(LocalDate startDate, LocalDate endDate, List<Long> employeeIds);

	List<TimeRecord> getTimeRecordsByTeam(List<Long> teamsFilter);

	List<TimeRecord> getTimeRecordsByTeamAndMonth(List<Long> teamsFilter, Month selectedMonth, Long currentUserId);

	List<TimeRecord> getTimeRecordsByEmployeeAndMonth(Long employeeId, Month selectedMonth);

	List<TimeRecord> getTimeRecordsByTeamAndDate(List<Long> teamsFilter, LocalDate currentDate, Long currentUserId);

	Long getTotalEmployeesTimeRecordCount(List<Long> employeeId, LocalDate startDate, LocalDate endDate);

	List<EmployeeTimeRecord> findEmployeesTimeRecords(List<Long> employeeId, LocalDate startDate, LocalDate endDate,
			int limit, long offset);

	List<EmployeeTimeRecord> findEmployeesTimeRecordsWithTeams(List<Long> employeeId, List<Long> teamIds,
			LocalDate startDate, LocalDate endDate, int limit, long offset);

	List<TimeRecordsByEmployeesDto> getTimeRecordsByEmployees(List<Long> employeeId, LocalDate startDate,
			LocalDate endDate);

	List<EmployeeWorkHours> getAllWorkHoursOfEmployee(Long employeeId, LocalDate startDate, LocalDate endDate);

	List<TimeRecordTrendDto> getEmployeeClockInTrend(List<Long> teams, String timeZone, LocalDate date);

	List<TimeRecordTrendDto> getEmployeeClockOutTrend(List<Long> teams, String timeZone, LocalDate date);

}
