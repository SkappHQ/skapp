package com.skapp.enterprise.common.controller.v1;

import com.skapp.enterprise.common.payload.response.EpVersionResponseDto;
import com.skapp.enterprise.common.service.EpVersionService;
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

@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/v1/ep/versions")
public class EpVersionController {

	private final EpVersionService epVersionService;

	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<EpVersionResponseDto> getVersions(
			@Parameter(name = "employeeIds", description = "Employee ID to retrieve versions",
					example = "1", schema = @Schema(type = "number", implementation = Long.class)) @RequestParam(
							value = "employeeId", required = false) Long employeeId) {

		return new ResponseEntity<>(epVersionService.getVersionsByUserId(employeeId), HttpStatus.OK);
	}

}
