package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.EpCalendarConfigRequestDto;
import com.skapp.enterprise.common.payload.request.EpOrganizationDto;
import com.skapp.enterprise.common.service.EpOrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@Slf4j
@RequestMapping("/v1/ep/organization")
public class EpOrganizationController {

	private final EpOrganizationService epOrganizationService;

	@PostMapping
	public ResponseEntity<ResponseEntityDto> organizationSetup(
			@Valid @RequestBody EpOrganizationDto epOrganizationDto) {
		ResponseEntityDto response = epOrganizationService.saveOrganization(epOrganizationDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@GetMapping(value = "/login-method", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getTenantLoginMethod(@RequestParam String tenantName) {
		return new ResponseEntity<>(epOrganizationService.getTenantLoginType(tenantName), HttpStatus.OK);
	}

	@PatchMapping("/calendar")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	public ResponseEntity<ResponseEntityDto> editCalendarConfigs(
			@Valid @RequestBody EpCalendarConfigRequestDto epCalendarConfigRequestDto) {
		ResponseEntityDto response = epOrganizationService.editCalendarConfigs(epCalendarConfigRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/calendar")
	public ResponseEntity<ResponseEntityDto> getCalendarConfigs() {
		ResponseEntityDto response = epOrganizationService.getCalendarConfigs();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/configs/quick-setup")
	public ResponseEntity<ResponseEntityDto> setQuickSetupCompleted() {
		ResponseEntityDto response = epOrganizationService.setQuickSetupCompleted();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
