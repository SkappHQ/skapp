package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.service.EmployeeSkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/people/skills")
@Tag(name = "Employee Skill Controller", description = "Endpoints for employee skill management")
public class EmployeeSkillController {

	private final EmployeeSkillService employeeSkillService;

	@Operation(summary = "Get all custom skills", description = "Retrieves all custom skills.")
	@PreAuthorize("hasAnyRole('ROLE_PEOPLE_EMPLOYEE')")
	@GetMapping
	public ResponseEntity<ResponseEntityDto> getAllCustomSkills() {
		ResponseEntityDto response = employeeSkillService.getAllCustomSkills();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
