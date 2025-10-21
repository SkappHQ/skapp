package com.skapp.enterprise.common.controller.v1;

import com.skapp.enterprise.common.payload.response.EpUserAuthPicResponseDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseDto;
import com.skapp.enterprise.people.service.EpUserService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/v1/ep/users")
public class EpUserController {

	private final EpUserService epUserService;

	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<List<EpUserResponseDto>> getUsers(
			@Parameter(name = "employeeIds", description = "List of employee IDs to retrieve (comma-separated)",
					example = "1,2,3", schema = @Schema(type = "array", implementation = Long.class)) @RequestParam(
							value = "employeeIds", required = false) List<Long> employeeIds,

			@Parameter(name = "search", description = "Search term for user email, name, or employee ID",
					example = "john") @RequestParam(value = "search", required = false) String search) {

		List<EpUserResponseDto> response = epUserService.getUsersByIdsOrSearch(employeeIds, search);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/auth-pics")
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<List<EpUserAuthPicResponseDto>> getUserAuthPics(
			@Parameter(name = "employeeIds", description = "List of employee IDs to retrieve (comma-separated)",
					example = "1,2,3", schema = @Schema(type = "array", implementation = Long.class)) @RequestParam(
							value = "employeeIds", required = false) List<Long> employeeIds,

			@Parameter(name = "search", description = "Search term for user email, name, or employee ID",
					example = "john") @RequestParam(value = "search", required = false) String search) {

		List<EpUserAuthPicResponseDto> response = epUserService.getUserAuthPicsByIdsOrSearch(employeeIds, search);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
