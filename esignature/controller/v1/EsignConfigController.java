package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.EsignConfigDto;
import com.skapp.enterprise.esignature.service.EsignConfigService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/ep/esign/config")
public class EsignConfigController {

	private final EsignConfigService esignConfigService;

	@Operation(summary = "Update global eSign configuration settings.",
			description = "This endpoint allows updating specific fields of the global eSign configuration, "
					+ "such as expiration days, reminder days, and date format, without requiring a full replacement of the existing configuration.")
	@PreAuthorize("hasAnyRole('ROLE_ESIGN_ADMIN')")
	@PatchMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> updateEsignConfig(@RequestBody EsignConfigDto dto) {

		ResponseEntityDto updatedEsignConfig = esignConfigService.updateEsignConfig(dto);

		return new ResponseEntity<>(updatedEsignConfig, HttpStatus.OK);
	}

	@Operation(summary = "Retrieve eSign global configuration settings.",
			description = "This endpoint retrieves the current eSign configuration settings,"
					+ " including expiration days, reminder days, and date format.")
	@PreAuthorize("hasAnyRole('ROLE_ESIGN_ADMIN', 'ESIGN_EMPLOYEE')")
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getEsignConfig() {

		ResponseEntityDto esignConfig = esignConfigService.getEsignConfig();

		return new ResponseEntity<>(esignConfig, HttpStatus.OK);
	}

	@Operation(summary = "Get eSign configuration settings for external document signing",
			description = "Retrieves the current global eSign configuration settings required for the external document signing process.")
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS','ESIGN_EMPLOYEE')")
	@GetMapping(value = "external", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getExternalEsignConfig() {

		ResponseEntityDto esignConfig = esignConfigService.getExternalEsignConfig();

		return new ResponseEntity<>(esignConfig, HttpStatus.OK);
	}

}
