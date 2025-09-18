package com.skapp.enterprise.invoice.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

	@Operation(summary = "Get a projects all projects or by customer",
			description = "Returns a list of all projects all projects or by customer.")

	@GetMapping(value = "/invoice-filter", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_INVOICE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> searchProjectsByName(HttpServletRequest request,
			@RequestParam(value = "customerId", required = false) Long customerId) {
		ResponseEntityDto response = projectService.getProjectsByCustomer(request, customerId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
