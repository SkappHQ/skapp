package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.enterprise.common.service.TenantService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/ep/tenant")
public class TenantController {

	@NonNull
	private final TenantService tenantService;

	@PostMapping("/create")
	public ResponseEntity<ResponseEntityDto> registerTenant(@RequestParam String tenantName,
			@RequestParam LoginMethod loginMethod) {
		tenantService.createTenant(tenantName, loginMethod);
		return new ResponseEntity<>(new ResponseEntityDto("Tenant created successfully", false), HttpStatus.CREATED);
	}

}
