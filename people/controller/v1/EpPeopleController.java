package com.skapp.enterprise.people.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.people.payload.request.DeactivateUsersRequestDto;
import com.skapp.enterprise.people.payload.request.TransferManagersAndSupervisorsRequestDto;
import com.skapp.enterprise.people.payload.request.UpdateUserLanguageRequestDto;
import com.skapp.enterprise.people.service.EpEmployeeTimelineService;
import com.skapp.enterprise.people.service.EpPeopleService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/people/ep")
@Tag(name = "Enterprise People Controller", description = "Endpoints for managing employees")
public class EpPeopleController {

	private final EpPeopleService epPeopleService;

	private final EpEmployeeTimelineService epEmployeeTimelineService;

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_EMPLOYEE')")
	@GetMapping(value = "/employees/check-limit")
	public ResponseEntity<ResponseEntityDto> getEmployeesLimit() {
		ResponseEntityDto response = epPeopleService.getEmployeesLimit();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_EMPLOYEE')")
	@GetMapping(value = "/employees/check-count")
	public ResponseEntity<ResponseEntityDto> getEmployeesCount() {
		ResponseEntityDto response = epPeopleService.getEmployeesCount();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_EMPLOYEE')")
	@GetMapping(value = "/employees/role-limit")
	public ResponseEntity<ResponseEntityDto> getEmployeeRoleLimit() {
		ResponseEntityDto response = epPeopleService.getEmployeeRoleLimit();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PEOPLE_ADMIN')")
	@GetMapping(value = "/employees/timeline/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getEmployeeTimelineRecords(@PathVariable Long id) {
		ResponseEntityDto response = epEmployeeTimelineService.getEmployeeTimelineRecords(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PEOPLE_MANAGER')")
	@GetMapping(value = "/managers-and-supervisors")
	public ResponseEntity<ResponseEntityDto> getManagersAndSupervisorsFromEmployeeIds(
			@RequestParam List<Long> employeeIds) {
		ResponseEntityDto response = epPeopleService.getManagersAndSupervisorsFromEmployeeIds(employeeIds);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	@PutMapping(value = "/managers-and-supervisors/transfer")
	public ResponseEntity<ResponseEntityDto> transferSupervisorsAndManagers(
			@RequestBody TransferManagersAndSupervisorsRequestDto transferManagersAndSupervisorsRequestDto) {
		ResponseEntityDto response = epPeopleService
			.transferSupervisorsAndManagers(transferManagersAndSupervisorsRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	@GetMapping(value = "/managers")
	public ResponseEntity<ResponseEntityDto> getManagersFromEmployeeIds(@RequestParam List<Long> employeeIds) {
		ResponseEntityDto response = epPeopleService.getManagerRoleEmployeesExcludingEmployeeIds(employeeIds);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	@PostMapping(value = "/deactivate-users")
	public ResponseEntity<ResponseEntityDto> deactivateUsers(@RequestBody DeactivateUsersRequestDto employeeIds) {
		ResponseEntityDto response = epPeopleService.deactivateUsers(employeeIds);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_EMPLOYEE','ROLE_ATTENDANCE_EMPLOYEE','ROLE_LEAVE_EMPLOYEE')")
	@GetMapping(value = "/user/language")
	public ResponseEntity<ResponseEntityDto> getCurrentUserLanguage() {
		ResponseEntityDto response = epPeopleService.getCurrentUserLanguage();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_EMPLOYEE','ROLE_ATTENDANCE_EMPLOYEE','ROLE_LEAVE_EMPLOYEE')")
	@PutMapping(value = "/user/language")
	public ResponseEntity<ResponseEntityDto> updateUserLanguage(@RequestBody UpdateUserLanguageRequestDto requestDto) {
		ResponseEntityDto response = epPeopleService.updateUserLanguage(requestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
