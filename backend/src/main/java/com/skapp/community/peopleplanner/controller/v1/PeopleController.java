package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeBulkDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeDataValidationDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeExportFilterDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeFilterDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeIsAvailableDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeQuickAddDto;
import com.skapp.community.peopleplanner.payload.request.NotificationSettingsPatchRequestDto;
import com.skapp.community.peopleplanner.payload.request.PermissionFilterDto;
import com.skapp.community.peopleplanner.payload.request.TransferSupervisorsRequestDto;
import com.skapp.community.peopleplanner.payload.request.employee.CreateEmployeeRequestDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeManagerResponseDto;
import com.skapp.community.peopleplanner.service.PeopleReadService;
import com.skapp.community.peopleplanner.service.PeopleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/people")
@Tag(name = "People Controller", description = "Endpoints for managing employees")
public class PeopleController {

	private final PeopleService peopleService;

	private final PeopleReadService peopleReadService;

	@Operation(summary = "Create a new employee",
			description = "This endpoint creates a new employee with the provided details.")
	@PostMapping(value = "/employee", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> addNewEmployee(
			@Valid @RequestBody CreateEmployeeRequestDto employeeDetailsDto) {
		ResponseEntityDto response = peopleService.createEmployee(employeeDetailsDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Quick add a new employee",
			description = "This endpoint quickly adds a new employee with limited details.")
	@PostMapping(value = "/employee/quick-add", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> addNewQuickAddEmployee(
			@Valid @RequestBody EmployeeQuickAddDto employeeQuickAddDto) {
		ResponseEntityDto response = peopleService.quickAddEmployee(employeeQuickAddDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Update an employee", description = "This endpoint updates an existing employee by their ID.")
	@PatchMapping(value = "/employee/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> updateEmployee(
			@PathVariable @Schema(description = "ID of the employee to update", example = "1") Long id,
			@Valid @RequestBody CreateEmployeeRequestDto createEmployeeRequestDto) {
		ResponseEntityDto response = peopleService.updateEmployee(id, createEmployeeRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get a list of employees",
			description = "This endpoint fetches a list of employees based on provided filters.")
	@GetMapping(value = "/employees", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getEmployees(EmployeeFilterDto employeeFilterDto) {
		ResponseEntityDto response = peopleService.getEmployees(employeeFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get a list of employees",
			description = "This endpoint fetches a list of employees based on provided filters to export.")
	@GetMapping(value = "/employees/export", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> exportEmployeesData(EmployeeExportFilterDto employeeExportFilterDto) {
		ResponseEntityDto response = peopleService.exportEmployees(employeeExportFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get employee by ID", description = "This endpoint fetches an employee by their ID.")
	@GetMapping(value = "/employee/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getEmployeeById(@PathVariable Long id) {
		ResponseEntityDto employeeResponse = peopleReadService.getEmployeeById(id);
		return new ResponseEntity<>(employeeResponse, HttpStatus.OK);
	}

	@Operation(summary = "Get current logged-in employee",
			description = "This endpoint fetches the current logged-in employee's details.")
	@GetMapping(value = "/me", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getCurrentEmployee() {
		return new ResponseEntity<>(peopleService.getCurrentEmployee(), HttpStatus.OK);
	}

	@Operation(summary = "Get current logged-in employee managers",
			description = "This endpoint fetches the current logged-in employee's managers.")
	@GetMapping(value = "/me/managers")
	public ResponseEntity<ResponseEntityDto> getCurrentEmployeeManagers() {
		List<EmployeeManagerResponseDto> employeeManagers = peopleService.getCurrentEmployeeManagers();
		return new ResponseEntity<>(new ResponseEntityDto(false, employeeManagers), HttpStatus.OK);
	}

	@Operation(summary = "Check if current logged-in employee has managers",
			description = "This endpoint checks if there are any managers assigned to the current logged-in employee.")
	@GetMapping(value = "/me/managers/availability")
	public ResponseEntity<ResponseEntityDto> isManagerAvailableForCurrentEmployee() {
		boolean isManagerAvailable = peopleService.isManagerAvailableForCurrentEmployee();
		return new ResponseEntity<>(new ResponseEntityDto(false, isManagerAvailable), HttpStatus.OK);
	}

	@Operation(summary = "Check if an employee is supervised by the current logged-in employee",
			description = "This endpoint checks if the current logged-in employee is supervising the provided employee.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_EMPLOYEE')")
	@GetMapping(value = "/{employeeId}/is-supervised-by-me")
	public ResponseEntity<ResponseEntityDto> isPrimarySecondaryOrTeamSupervisor(@PathVariable Long employeeId) {
		return new ResponseEntity<>(peopleService.isPrimarySecondaryOrTeamSupervisor(employeeId), HttpStatus.OK);
	}

	@Operation(summary = "Check if an employee is a primary, secondary or team supervisor ",
			description = "This endpoint checks if the given employee is supervising an employee or team.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_MANAGER')")
	@GetMapping(value = "/{employeeId}/has-supervisory-roles")
	public ResponseEntity<ResponseEntityDto> hasSupervisoryRoles(@PathVariable Long employeeId) {
		return new ResponseEntity<>(peopleService.hasSupervisoryRoles(employeeId), HttpStatus.OK);
	}

	@Operation(summary = "Bulk add employees", description = "This endpoint allows adding multiple employees at once.")
	@PostMapping(value = "/bulk/employees", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> addBulkEmployees(@RequestBody List<EmployeeBulkDto> employeeBulkDto) {
		ResponseEntityDto response = peopleService.addBulkEmployees(employeeBulkDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@GetMapping(value = "/pending-employee-count", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getLoginPendingEmployeeCount() {
		ResponseEntityDto response = peopleService.getLoginPendingEmployeeCount();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping(value = "/search/employee", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> searchEmployeesByNameOrEmail(
			@Valid PermissionFilterDto permissionFilterDto) {
		ResponseEntityDto response = peopleService.searchEmployeesByNameOrEmail(permissionFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping(value = "/search/email-exists", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> searchEmployeesByEmail(
			@Valid EmployeeIsAvailableDto employeeIsAvailableDto) {
		ResponseEntityDto response = peopleService.searchEmployeesByEmail(employeeIsAvailableDto.getEmail());
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping(value = "/check-email-identification-no", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getEmployeeByIdOrEmail(
			@Valid EmployeeDataValidationDto employeeDataValidationDto) {
		ResponseEntityDto response = peopleService.getEmployeeByIdOrEmail(employeeDataValidationDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Terminate an user", description = "Terminate an user account")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	@PatchMapping("/user/terminate/{userId}")
	public ResponseEntity<ResponseEntityDto> terminateUser(@PathVariable Long userId) {
		ResponseEntityDto response = peopleService.terminateUser(userId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Delete an user", description = "Delete an user account")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	@PatchMapping("/user/delete/{userId}")
	public ResponseEntity<ResponseEntityDto> deleteUser(@PathVariable Long userId) {
		ResponseEntityDto response = peopleService.deleteUser(userId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get supervised employees and teams of a user",
			description = "Returns the employees this user is primary supervisor for and the teams this user supervises")
	@PreAuthorize("hasAnyRole('ROLE_PEOPLE_ADMIN')")
	@GetMapping("/user/{userId}/supervised-employees-teams")
	public ResponseEntity<ResponseEntityDto> getSupervisedEmployeesAndTeams(@PathVariable Long userId) {
		ResponseEntityDto response = peopleService.getSupervisedEmployeesAndTeams(userId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Transfer supervisor roles of a user",
			description = "Reassigns primary supervisor and team supervisor roles from the given user to new supervisors before termination or deletion")
	@PreAuthorize("hasAnyRole('ROLE_PEOPLE_ADMIN')")
	@PatchMapping("/user/{userId}/transfer-supervisors")
	public ResponseEntity<ResponseEntityDto> transferSupervisors(@PathVariable Long userId,
			@RequestBody TransferSupervisorsRequestDto requestDto) {
		ResponseEntityDto response = peopleService.transferSupervisors(userId, requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_PEOPLE_MANAGER','ROLE_ATTENDANCE_MANAGER','ROLE_LEAVE_MANAGER')")
	@PatchMapping("/user/notification/settings")
	public ResponseEntity<ResponseEntityDto> updateNotificationSettings(
			@RequestBody NotificationSettingsPatchRequestDto notificationSettingsPatchRequestDto) {
		ResponseEntityDto response = peopleService.updateNotificationSettings(notificationSettingsPatchRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/user/notification/settings")
	public ResponseEntity<ResponseEntityDto> getNotificationSettings() {
		ResponseEntityDto response = peopleService.getNotificationSettings();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_ATTENDANCE_MANAGER', 'ROLE_LEAVE_MANAGER')")
	@GetMapping(value = "/search/employee-team", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> searchEmployeesAndTeamsBySearchKeyword(@RequestParam String keyword) {
		ResponseEntityDto response = peopleService.searchEmployeesAndTeamsByKeyword(keyword);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
