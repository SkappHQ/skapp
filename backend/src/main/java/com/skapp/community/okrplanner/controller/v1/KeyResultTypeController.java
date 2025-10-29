package com.skapp.community.okrplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.service.KeyResultTypeService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/key-result-types")
public class KeyResultTypeController {

	private final KeyResultTypeService keyResultTypeService;

	@Operation(summary = "Get Key Result Types", description = "Retrieve the default key result types.")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_OKR_ADMIN')")
	@GetMapping
	public ResponseEntity<ResponseEntityDto> getKeyResultTypes() {

		ResponseEntityDto responseEntityDto = keyResultTypeService.getKeyResultTypes();

		return ResponseEntity.ok(responseEntityDto);
	}

}
