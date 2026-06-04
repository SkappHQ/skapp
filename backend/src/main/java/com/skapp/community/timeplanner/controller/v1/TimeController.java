package com.skapp.community.timeplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeTimeRequestFilterDto;
import com.skapp.community.peopleplanner.payload.request.ManagerEmployeeLogFilterDto;
import com.skapp.community.timeplanner.payload.request.AddTimeRecordDto;
import com.skapp.community.timeplanner.payload.request.EditTimeRequestDto;
import com.skapp.community.timeplanner.payload.request.EmployeeAttendanceSummaryFilterDto;
import com.skapp.community.timeplanner.payload.request.GetTimeConfigDeleteAvailabilityRequestDto;
import com.skapp.community.timeplanner.payload.request.IndividualWorkHourFilterDto;
import com.skapp.community.timeplanner.payload.request.ManagerAttendanceSummaryFilterDto;
import com.skapp.community.timeplanner.payload.request.ManagerTimeRecordFilterDto;
import com.skapp.community.timeplanner.payload.request.ManagerTimeRequestFilterDto;
import com.skapp.community.timeplanner.payload.request.ManualEntryRequestDto;
import com.skapp.community.timeplanner.payload.request.TeamTimeRecordFilterDto;
import com.skapp.community.timeplanner.payload.request.TimeConfigDto;
import com.skapp.community.timeplanner.payload.request.TimeRecordFilterDto;
import com.skapp.community.timeplanner.payload.request.TimeRequestAvailabilityRequestDto;
import com.skapp.community.timeplanner.payload.request.TimeRequestManagerPatchDto;
import com.skapp.community.timeplanner.payload.request.UpdateIncompleteTimeRecordsRequestDto;
import com.skapp.community.timeplanner.payload.request.UpdateTimeRequestsFilterDto;
import com.skapp.community.timeplanner.service.TimeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/time")
@Tag(name = "Time Controller", description = "Operations related to time recordings")
public class TimeController {

	private final TimeService timeService;

	@Operation(summary = "Update time configuration",
			description = "Update time config for a particular day if it not exists creates the config")
	@PreAuthorize("hasAnyRole('ATTENDANCE_ADMIN')")
	@PatchMapping(value = "/config")
	public ResponseEntity<ResponseEntityDto> updateTimeConfig(@RequestBody TimeConfigDto timeConfigDto) {
		ResponseEntityDto response = timeService.updateTimeConfigs(timeConfigDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get default time configuration", description = "Get all the time configurations available")
	@PreAuthorize("hasAnyRole('ATTENDANCE_EMPLOYEE')")
	@GetMapping(value = "/config")
	public ResponseEntity<ResponseEntityDto> getDefaultTimeConfig() {
		ResponseEntityDto response = timeService.getDefaultTimeConfigurations();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Active slots", description = "Returns all the active time slots slots")
	@PreAuthorize("hasAnyRole('ATTENDANCE_EMPLOYEE')")
	@GetMapping(value = "/active-slot")
	public ResponseEntity<ResponseEntityDto> getActiveTimeSlot() {
		ResponseEntityDto response = timeService.getActiveTimeSlot();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Work summary", description = "Returns attendance summary of an employee")
	@PreAuthorize("hasAnyRole('ATTENDANCE_EMPLOYEE')")
	@GetMapping(value = "/work-summary")
	public ResponseEntity<ResponseEntityDto> getEmployeeAttendanceSummary(
			EmployeeAttendanceSummaryFilterDto employeeAttendanceSummaryFilterDto) {
		ResponseEntityDto response = timeService.getEmployeeAttendanceSummary(employeeAttendanceSummaryFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Time records", description = "Returns all the daily time records by employee")
	@PreAuthorize("hasAnyRole('ATTENDANCE_EMPLOYEE')")
	@GetMapping(value = "/daily-time-records")
	public ResponseEntity<ResponseEntityDto> getEmployeeDailyTimeRecords(TimeRecordFilterDto timeRecordFilterDto) {
		ResponseEntityDto response = timeService.getEmployeeDailyTimeRecords(timeRecordFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Time records", description = "Returns all the daily time records by employee ID")
	@PreAuthorize("hasAnyRole('ATTENDANCE_EMPLOYEE')")
	@GetMapping(value = "/daily-time-records/{id}")
	public ResponseEntity<ResponseEntityDto> getEmployeeDailyTimeRecordsByEmployeeId(
			TimeRecordFilterDto timeRecordFilterDto, @PathVariable Long id) {
		ResponseEntityDto response = timeService.getEmployeeDailyTimeRecordsByEmployeeId(timeRecordFilterDto, id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Time requests", description = "Returns all the time requests by employee")
	@PreAuthorize("hasAnyRole('ATTENDANCE_EMPLOYEE')")
	@GetMapping(value = "/requests")
	public ResponseEntity<ResponseEntityDto> getAllTimeRequestsByEmployeeId(
			EmployeeTimeRequestFilterDto employeeTimeRequestFilterDto) {
		ResponseEntityDto response = timeService.getAllRequestsOfEmployee(employeeTimeRequestFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Date time availability", description = "Returns availability of requested date and time")
	@PreAuthorize("hasAnyRole('ATTENDANCE_EMPLOYEE')")
	@GetMapping(value = "/request-period-availability")
	public ResponseEntity<ResponseEntityDto> getRequestedTimeAvailability(
			TimeRequestAvailabilityRequestDto requestDto) {
		ResponseEntityDto response = timeService.getRequestedDateTimeAvailability(requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Incomplete Clock-outs", description = "Returns current user's incomplete time records")
	@PreAuthorize("hasAnyRole('ATTENDANCE_EMPLOYEE')")
	@GetMapping(value = "/incomplete-clockouts")
	public ResponseEntity<ResponseEntityDto> getCurrentUserIncompleteTimeRecords() {
		ResponseEntityDto response = timeService.getIncompleteClockOuts();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Manual Entry", description = "Creates manual entry")
	@PreAuthorize("hasAnyRole('ATTENDANCE_EMPLOYEE')")
	@PostMapping(value = "/manual-entry")
	public ResponseEntity<ResponseEntityDto> addManualEntryRequest(@RequestBody ManualEntryRequestDto timeRequestDto) {
		ResponseEntityDto response = timeService.addManualEntryRequest(timeRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Time request update", description = "Update an existing time request")
	@PreAuthorize("hasAnyRole('ATTENDANCE_EMPLOYEE')")
	@PatchMapping(value = "/requests-update")
	public ResponseEntity<ResponseEntityDto> updateTimeRequests(
			UpdateTimeRequestsFilterDto updateTimeRequestsFilterDto) {
		ResponseEntityDto response = timeService.updateTimeRequests(updateTimeRequestsFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Incomplete time request update",
			description = "Updates incomplete time requests by the employee")
	@PreAuthorize("hasAnyRole('ATTENDANCE_EMPLOYEE')")
	@PatchMapping(value = "/incomplete-clockouts/{id}")
	public ResponseEntity<ResponseEntityDto> updateCurrentUserIncompleteTimeRecords(@PathVariable Long id,
			@RequestBody UpdateIncompleteTimeRecordsRequestDto requestDto) {
		ResponseEntityDto response = timeService.updateCurrentUserIncompleteTimeRecords(id, requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Manager attendance summary", description = "Returns attendance summary of manager's team")
	@PreAuthorize("hasAnyRole('ATTENDANCE_MANAGER')")
	@GetMapping(value = "/attendance-summary")
	public ResponseEntity<ResponseEntityDto> managerAttendanceSummary(
			ManagerAttendanceSummaryFilterDto managerAttendanceSummaryFilterDto) {
		ResponseEntityDto response = timeService.getManagerAttendanceSummary(managerAttendanceSummaryFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Manager update time request", description = "Manager updates a time request he received")
	@PreAuthorize("hasAnyRole('ATTENDANCE_MANAGER')")
	@PatchMapping(value = "/time-request/{id}")
	public ResponseEntity<ResponseEntityDto> updateTimeRequestByManager(@PathVariable Long id,
			@RequestBody TimeRequestManagerPatchDto timeRequestManagerPatchDto) {
		ResponseEntityDto response = timeService.updateTimeRequestByManager(id, timeRequestManagerPatchDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Manager time records", description = "Returns all the time recording of his teams")
	@PreAuthorize("hasAnyRole('ATTENDANCE_MANAGER')")
	@GetMapping(value = "/team-time-records")
	public ResponseEntity<ResponseEntityDto> managerAssignUsersTimeRecords(
			ManagerTimeRecordFilterDto managerTimeRecordFilterDto) {
		ResponseEntityDto response = timeService.managerAssignUsersTimeRecords(managerTimeRecordFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Manager time requests", description = "Returns all the time requests of his teams")
	@PreAuthorize("hasAnyRole('ATTENDANCE_MANAGER')")
	@GetMapping(value = "/time-requests")
	public ResponseEntity<ResponseEntityDto> getAllAssignEmployeesTimeRequests(
			ManagerTimeRequestFilterDto timeRequestFilterDto) {
		ResponseEntityDto response = timeService.getAllAssignEmployeesTimeRequests(timeRequestFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Manager team time record summary",
			description = "Returns all the manager team time record summary")
	@PreAuthorize("hasAnyRole('ATTENDANCE_MANAGER')")
	@GetMapping(value = "/team-time-record-summary")
	public ResponseEntity<ResponseEntityDto> managerTeamTimeRecordSummary(
			TeamTimeRecordFilterDto timeRecordSummaryDto) {
		ResponseEntityDto response = timeService.managerTeamTimeRecordSummary(timeRecordSummaryDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Employee daily log", description = "Returns manager supervising employee's daily log")
	@PreAuthorize("hasAnyRole('ATTENDANCE_MANAGER')")
	@GetMapping(value = "/employee-daily-log")
	public ResponseEntity<ResponseEntityDto> getManagerEmployeeDailyLog(
			ManagerEmployeeLogFilterDto managerEmployeeLogFilterDto) {
		ResponseEntityDto response = timeService.getManagerEmployeeDailyLog(managerEmployeeLogFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Work hour graph", description = "Returns manager supervising employee's work hour graph")
	@PreAuthorize("hasAnyRole('ATTENDANCE_MANAGER')")
	@GetMapping(value = "/work-hour-graph")
	public ResponseEntity<ResponseEntityDto> getIndividualWorkHoursBySupervisor(IndividualWorkHourFilterDto filterDto) {
		ResponseEntityDto response = timeService.getIndividualWorkHoursBySupervisor(filterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Individual utilization",
			description = "Returns manager supervising employee's work time utilization")
	@PreAuthorize("hasAnyRole('ATTENDANCE_MANAGER')")
	@GetMapping(value = "/individual-utilization/{id}")
	public ResponseEntity<ResponseEntityDto> individualWorkTimeUtilizationByManager(@PathVariable Long id) {
		ResponseEntityDto response = timeService.getIndividualWorkUtilizationByManager(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Add Time Record",
			description = "Adds a new time record for an employee based on the provided details.")
	@PreAuthorize("hasAnyRole('ATTENDANCE_EMPLOYEE')")
	@PostMapping(value = "/record")
	public ResponseEntity<ResponseEntityDto> addTimeRecord(@RequestBody AddTimeRecordDto addTimeRecordDto) {
		ResponseEntityDto response = timeService.addTimeRecord(addTimeRecordDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Get pending time requests",
			description = "Returns all the pending time requests of the employee")
	@PreAuthorize("hasAnyRole('ATTENDANCE_MANAGER')")
	@GetMapping(value = "/pending-requests/count")
	public ResponseEntity<ResponseEntityDto> getPendingTimeRequestsCount() {
		ResponseEntityDto response = timeService.getPendingTimeRequestsCount();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Edit Time Request",
			description = "Edits an existing time request with the updated information provided.")
	@PreAuthorize("hasAnyRole('ATTENDANCE_EMPLOYEE')")
	@PatchMapping(value = "/request")
	public ResponseEntity<ResponseEntityDto> editTimeRequest(@RequestBody EditTimeRequestDto timeRequestDto) {
		ResponseEntityDto response = timeService.editTimeRequest(timeRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get time configuration removability ",
			description = "Get if time configuration can be removed ")
	@PreAuthorize("hasAnyRole('ATTENDANCE_EMPLOYEE')")
	@GetMapping(value = "/config/is-removable")
	public ResponseEntity<ResponseEntityDto> getTimeConfigDeleteAvailability(
			GetTimeConfigDeleteAvailabilityRequestDto requestDto) {
		ResponseEntityDto response = timeService.getIfTimeConfigRemovable(requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
