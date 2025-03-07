package com.skapp.enterprise.people.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

}
