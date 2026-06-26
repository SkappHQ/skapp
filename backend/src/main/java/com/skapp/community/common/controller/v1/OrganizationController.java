package com.skapp.community.common.controller.v1;

import com.skapp.community.common.payload.request.EmailServerRequestDto;
import com.skapp.community.common.payload.request.OrganizationDto;
import com.skapp.community.common.payload.request.UpdateOrganizationRequestDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.OrganizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/organization")
@Tag(name = "Organization Controller", description = "Operations related to organization functionalities")
public class OrganizationController {

	private final OrganizationService organizationService;

	@Operation(summary = "Create an Organization",
			description = "This endpoint sets up an organization with the provided details.")
	@PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> organizationSetup(@Valid @RequestBody OrganizationDto organizationDto) {
		ResponseEntityDto response = organizationService.saveOrganization(organizationDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Get Organization",
			description = "This endpoint returns all the details about the organization.")
	@GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getOrganization() {
		ResponseEntityDto response = organizationService.getOrganization();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PatchMapping("/configs/email")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	public ResponseEntity<ResponseEntityDto> configureEmailServer(
			@Valid @RequestBody EmailServerRequestDto emailServerRequestDto) {
		ResponseEntityDto response = organizationService.saveEmailServerConfigs(emailServerRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/configs")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	public ResponseEntity<ResponseEntityDto> getOrganizationConfig() {
		ResponseEntityDto response = organizationService.getOrganizationConfigs();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PatchMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	public ResponseEntity<ResponseEntityDto> updateOrganization(
			@Valid @RequestBody UpdateOrganizationRequestDto organizationDto) {
		ResponseEntityDto response = organizationService.updateOrganization(organizationDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
