package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.EpOrganizationDto;
import com.skapp.enterprise.common.service.EpOrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
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

}
