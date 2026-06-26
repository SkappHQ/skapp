package com.skapp.community.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.AppSetupStatusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/app-setup-status")
@Tag(name = "App Setup Status Controller", description = "Operations related to app setup status functionalities")
public class AppSetupStatusController {

	private final AppSetupStatusService appSetupStatusService;

	@Operation(summary = "Get App Setup Status", description = "This endpoint returns the status of the app setup.")
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getAppSetupStatus() {
		ResponseEntityDto response = appSetupStatusService.getAppSetupStatus();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
