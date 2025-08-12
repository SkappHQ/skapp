package com.skapp.community.okrplanner.controller;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.payload.OkrConfigDto;
import com.skapp.community.okrplanner.service.OkrService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/okr")
@Tag(name = "OKR Controller", description = "Operations related to objectives and key results")
public class OkrController {

	final OkrService okrService;

	@Operation(summary = "Get OKR configuration",
			description = "Retrieve the default / configured OKR configuration value")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'OKR_ADMIN')")
	@GetMapping(value = "/config", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getOkrConfig() {
		return new ResponseEntity<>(okrService.getOkrConfiguration(), HttpStatus.OK);
	}

	@Operation(summary = "Create / update OKR configuration",
			description = "Update the OKR configuration, if it not exists creates the configuration")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'OKR_ADMIN')")
	@PutMapping(value = "/config", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> upsertOkrConfig(@Valid @RequestBody OkrConfigDto okrConfigDto) {
		return new ResponseEntity<>(okrService.upsertOkrConfiguration(okrConfigDto), HttpStatus.OK);
	}

}
