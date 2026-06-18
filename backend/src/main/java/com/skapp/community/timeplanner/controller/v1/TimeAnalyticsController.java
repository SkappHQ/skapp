package com.skapp.community.timeplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.timeplanner.payload.request.AttendanceDashboardSummaryFilterDto;
import com.skapp.community.timeplanner.payload.request.AverageHoursWorkedTrendFilterDto;
import com.skapp.community.timeplanner.payload.request.ClockInClockOutTrendFilterDto;
import com.skapp.community.timeplanner.payload.request.ClockInSummaryFilterDto;
import com.skapp.community.timeplanner.payload.request.LateArrivalTrendFilterDto;
import com.skapp.community.timeplanner.service.TimeAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/time/analytics")
@Tag(name = "Time Analytics Controller", description = "Operations related to time analytics")
public class TimeAnalyticsController {

	private final TimeAnalyticsService timeAnalyticsService;

	@Operation(summary = "Get Clock In and Clock Out Trend",
			description = "Fetches clock-in and clock-out trends based on the provided filters.")
	@PreAuthorize("hasAnyRole('ATTENDANCE_MANAGER')")
	@GetMapping("/clockin-clockout-trend")
	public ResponseEntity<ResponseEntityDto> getClockInClockOutTrend(
			ClockInClockOutTrendFilterDto clockInClockOutTrendFilterDto) {
		ResponseEntityDto response = timeAnalyticsService.getClockInClockOutTrend(clockInClockOutTrendFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get Late Arrival Trend",
			description = "Fetches late arrival trends based on the provided filters.")
	@PreAuthorize("hasAnyRole('ATTENDANCE_MANAGER')")
	@GetMapping("/late-arrival-trend")
	public ResponseEntity<ResponseEntityDto> lateArrivalTrend(LateArrivalTrendFilterDto lateArrivalTrendFilterDto) {
		ResponseEntityDto response = timeAnalyticsService.lateArrivalTrend(lateArrivalTrendFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get Average Hours Worked Trend",
			description = "Fetches average hours worked trend based on the provided filters.")
	@PreAuthorize("hasAnyRole('ATTENDANCE_MANAGER')")
	@GetMapping("/average-hours-worked-trend")
	public ResponseEntity<ResponseEntityDto> averageHoursWorkedTrend(
			AverageHoursWorkedTrendFilterDto averageHoursWorkedTrendFilterDto) {
		ResponseEntityDto response = timeAnalyticsService.averageHoursWorkedTrend(averageHoursWorkedTrendFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get Attendance Dashboard Summary",
			description = "Fetches the summary for the attendance dashboard based on the provided filters.")
	@PreAuthorize("hasAnyRole('ATTENDANCE_MANAGER')")
	@GetMapping("/dashboard-summary")
	public ResponseEntity<ResponseEntityDto> attendanceDashboardSummary(
			AttendanceDashboardSummaryFilterDto attendanceDashboardSummaryFilterDto) {
		ResponseEntityDto response = timeAnalyticsService
			.attendanceDashboardSummary(attendanceDashboardSummaryFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get Clock In Summary",
			description = "Fetches the summary of clock-in based on the provided filters.")
	@PreAuthorize("hasAnyRole('ATTENDANCE_MANAGER')")
	@GetMapping(value = "/clockin-summary")
	public ResponseEntity<ResponseEntityDto> clockInSummary(ClockInSummaryFilterDto clockInSummaryFilterDto) {
		ResponseEntityDto response = timeAnalyticsService.clockInSummary(clockInSummaryFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get individual work time utilization",
			description = "Returns work time utilization for a specific employee")
	@PreAuthorize("hasAnyRole('ATTENDANCE_MANAGER')")
	@GetMapping(value = "/individual-utilization/{id}")
	public ResponseEntity<ResponseEntityDto> individualWorkTimeUtilization(@PathVariable Long id) {
		ResponseEntityDto response = timeAnalyticsService.getIndividualWorkUtilization(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get Average Hours Worked Trend for employee",
			description = "Fetches average hours worked trend based on the provided filters.")
	@PreAuthorize("hasAnyRole('ATTENDANCE_MANAGER')")
	@GetMapping("/average-employee-hours-worked-trend/{id}")
	public ResponseEntity<ResponseEntityDto> averageHoursWorkedTrendForEmployee(
			AverageHoursWorkedTrendFilterDto averageHoursWorkedTrendFilterDto, @PathVariable Long id) {
		ResponseEntityDto response = timeAnalyticsService
			.averageEmployeeHoursWorkedTrend(averageHoursWorkedTrendFilterDto, id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
