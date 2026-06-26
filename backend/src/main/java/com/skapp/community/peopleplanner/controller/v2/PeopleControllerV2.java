package com.skapp.community.peopleplanner.controller.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeFilterDtoV2;
import com.skapp.community.peopleplanner.service.v2.PeopleServiceV2;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v2/people")
@Tag(name = "People Controller V2", description = "Endpoints for managing employees")
public class PeopleControllerV2 {

	private final PeopleServiceV2 peopleService;

	@Operation(summary = "Get a list of employees",
			description = "This endpoint fetches a list of employees based on provided filters.")
	@GetMapping(value = "/employees")
	public ResponseEntity<ResponseEntityDto> getEmployees(EmployeeFilterDtoV2 employeeFilterDto) {
		ResponseEntityDto response = peopleService.getEmployees(employeeFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
