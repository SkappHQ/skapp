package com.skapp.enterprise.timeplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.timeplanner.service.EpTimeInternalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/v1/ep/time")
@Tag(name = "Time Internal API", description = "Internal endpoints for time configuration used by the PM service")
public class EpTimeInternalController {

	private final EpTimeInternalService epTimeInternalService;

	@GetMapping(value = "/config", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	@Operation(summary = "Get organization time config",
			description = "Returns the organization's working day time configurations sorted by day of week.")
	public ResponseEntity<ResponseEntityDto> getOrganizationTimeConfigs() {
		return new ResponseEntity<>(new ResponseEntityDto(false, epTimeInternalService.getOrganizationTimeConfigs()),
				HttpStatus.OK);
	}

}
