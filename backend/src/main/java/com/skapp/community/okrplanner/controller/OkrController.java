package com.skapp.community.okrplanner.controller;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.payload.OkrConfigDto;
import com.skapp.community.okrplanner.service.OkrConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/okr")
@Tag(name = "OKR Controller", description = "Operations related to objectives and key results")
public class OkrController {

	private final OkrConfigService okrConfigService;

	@Operation(summary = "Get OKR configuration",
			description = "Retrieve the default / configured OKR configuration value")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_OKR_ADMIN')")
	@GetMapping(value = "/config", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getOkrConfig() {
		return new ResponseEntity<>(okrConfigService.getOkrConfiguration(), HttpStatus.OK);
	}

	@Operation(summary = "Update OKR configuration", description = "Update the OKR configuration")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_OKR_ADMIN')")
	@PutMapping(value = "/config", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> updateOkrConfig(@Valid @RequestBody OkrConfigDto okrConfigDto) {
		return new ResponseEntity<>(okrConfigService.updateOkrConfiguration(okrConfigDto), HttpStatus.OK);
	}

}
