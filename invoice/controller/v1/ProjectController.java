package com.skapp.enterprise.invoice.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.ProjectFilterRequestDto;
import com.skapp.enterprise.invoice.payload.request.ProjectMemberFilterDto;
import com.skapp.enterprise.invoice.payload.request.invoice.TeamMemberBillableRateUpdateRequestDto;
import com.skapp.enterprise.invoice.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/invoice/project")
public class ProjectController {

	private final ProjectService projectService;

	@Operation(summary = "Get a list of all projects in the tenant",
			description = "Returns a list of projects created in the tenant.")

	@GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_INVOICE_ADMIN','ROLE_INVOICE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getAllProjects(HttpServletRequest request) {
		ResponseEntityDto response = projectService.getAllProjects(request);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get all projects or by customer",
			description = "Returns a list of all projects or by customer.")

	@GetMapping(value = "/invoice-filter", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_INVOICE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> searchProjectsByName(HttpServletRequest request,
			@RequestParam(value = "customerId", required = false) Long customerId) {
		ResponseEntityDto response = projectService.getProjectsByCustomer(request, customerId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get all projects summary details of a customer",
			description = "Returns a list of all projects summary details of a customer.")

	@GetMapping(value = "/by-customer", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_INVOICE_ADMIN', 'ROLE_INVOICE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getProjectsByCustomer(HttpServletRequest request,
			@Valid ProjectFilterRequestDto projectFilterRequestDto) {
		ResponseEntityDto response = projectService.getProjectsSummaryByCustomer(request, projectFilterRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get all project's Team Members",
			description = "Returns a list of all team members in the project.")

	@GetMapping(value = "/member", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_INVOICE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> getProjectsMembersByProject(HttpServletRequest request,
			@Valid ProjectMemberFilterDto projectMemberFilterRequestDto) {
		ResponseEntityDto response = projectService.getProjectMembers(request, projectMemberFilterRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Update Team Members Billable Rates", description = "Update Team Members Billable Rates.")

	@PatchMapping(value = "/member-rate", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_INVOICE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> updateTeamMemberBillableRates(
			@RequestParam @Schema(description = "ID of the customer to update", example = "1") Long customerId,
			@RequestParam @Schema(description = "ID of the project to update", example = "1") Long projectId,
			@RequestBody List<TeamMemberBillableRateUpdateRequestDto> TeamMemberBillableRateUpdateRequestDtos) {
		ResponseEntityDto response = projectService.updateTeamMemberBillableRates(customerId, projectId,
				TeamMemberBillableRateUpdateRequestDtos);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
