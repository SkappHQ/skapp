package com.skapp.community.peopleplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.type.ModuleType;
import com.skapp.community.peopleplanner.payload.request.ModuleRoleRestrictionRequestDto;
import com.skapp.community.peopleplanner.payload.response.ModuleRoleRestrictionResponseDto;
import com.skapp.community.peopleplanner.service.RolesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/roles")
@Tag(name = "Roles Controller", description = "Endpoints for user role management")
public class RolesController {

	private final RolesService rolesService;

	@Operation(summary = "Get System User Roles", description = "Retrieve the roles available in the system by module")
	@GetMapping("/system")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_ADMIN')")
	public ResponseEntity<ResponseEntityDto> getSystemRoles() {
		ResponseEntityDto response = rolesService.getSystemRoles();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get Allowed User Roles",
			description = "Retrieve allowed roles for the currently logged-in user based on module restrictions")
	@GetMapping
	public ResponseEntity<ResponseEntityDto> getAllowedRoles() {
		ResponseEntityDto response = rolesService.getAllowedRoles();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Update Role Restrictions",
			description = "Update the role assignment restrictions by specifying a module type")
	@PatchMapping("/restrictions")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	public ResponseEntity<ResponseEntityDto> updateRoleRestrictions(
			@RequestBody ModuleRoleRestrictionRequestDto moduleRoleRestrictionRequestDto) {
		ResponseEntityDto response = rolesService.updateRoleRestrictions(moduleRoleRestrictionRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get Restricted Roles by Module",
			description = "Retrieve the restricted roles for a specific module")
	@GetMapping("/restrictions/{module}")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	public ResponseEntity<ResponseEntityDto> getRestrictedRolesByModule(@Valid @PathVariable String module) {
		ModuleRoleRestrictionResponseDto restrictionResponse = rolesService
			.getRestrictedRoleByModule(ModuleType.valueOf(module));
		ResponseEntityDto response = new ResponseEntityDto(false, restrictionResponse);

		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/super-admin-count")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN','ROLE_PEOPLE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getSuperAdminCount() {
		ResponseEntityDto response = rolesService.getSuperAdminCount();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
