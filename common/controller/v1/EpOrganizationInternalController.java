package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@Slf4j
@RequestMapping("/internal/v1/ep/organization")
public class EpOrganizationInternalController {

	private final OrganizationService organizationService;

	@GetMapping("/timezone")
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<ResponseEntityDto> getOrganizationTimezone() {
		String timezone = organizationService.getOrganizationTimeZone();
		ResponseEntityDto response = new ResponseEntityDto(false, timezone);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}