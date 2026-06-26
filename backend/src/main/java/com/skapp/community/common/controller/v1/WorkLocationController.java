package com.skapp.community.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.payload.request.WorkLocationFilterDto;
import com.skapp.community.common.payload.request.WorkLocationRequestDto;
import com.skapp.community.common.service.WorkLocationService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/com/work-location")
public class WorkLocationController {

	private final WorkLocationService workLocationService;

	@Operation(summary = "Get all work locations",
			description = "Retrieves a paginated and optionally filtered list of work locations, sorted alphabetically by name.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ATTENDANCE_ADMIN','ROLE_PEOPLE_ADMIN')")
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getWorkLocations(WorkLocationFilterDto workLocationFilterDto) {

		ResponseEntityDto response = workLocationService.getWorkLocations(workLocationFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get all work locations without pagination",
			description = "Retrieves all work locations without pagination.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ATTENDANCE_ADMIN','ROLE_PEOPLE_EMPLOYEE')")
	@GetMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getAllWorkLocations() {

		ResponseEntityDto response = workLocationService.getAllWorkLocations();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Check if work location name exists",
			description = "Returns whether a work location name already exists.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ATTENDANCE_ADMIN','ROLE_PEOPLE_ADMIN')")
	@GetMapping(value = "/name-exists", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> checkWorkLocationNameExists(@RequestParam String name) {

		ResponseEntityDto response = workLocationService.checkWorkLocationNameExists(name);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get a work location by ID",
			description = "Retrieves a single work location with its employees and geo-fence details.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ATTENDANCE_ADMIN','ROLE_PEOPLE_ADMIN')")
	@GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getWorkLocationById(@PathVariable Long id) {

		ResponseEntityDto response = workLocationService.getWorkLocationById(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Create a work location",
			description = "Creates a new work location with an optional geo-fence and employee assignments.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ATTENDANCE_ADMIN','ROLE_PEOPLE_ADMIN')")
	@PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> createWorkLocation(
			@RequestBody WorkLocationRequestDto workLocationRequestDto) {

		ResponseEntityDto response = workLocationService.createWorkLocation(workLocationRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Update a work location",
			description = "Updates an existing work location's name, employee assignments, and geo-fence.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ATTENDANCE_ADMIN','ROLE_PEOPLE_ADMIN')")
	@PatchMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> updateWorkLocation(@PathVariable Long id,
			@RequestBody WorkLocationRequestDto workLocationRequestDto) {

		ResponseEntityDto response = workLocationService.updateWorkLocation(id, workLocationRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Delete a work location",
			description = "Deletes a work location along with its employee assignments and geo-fence.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_ATTENDANCE_ADMIN','ROLE_PEOPLE_ADMIN')")
	@DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> deleteWorkLocation(@PathVariable Long id) {

		ResponseEntityDto response = workLocationService.deleteWorkLocation(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
