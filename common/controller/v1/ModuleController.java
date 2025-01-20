package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.SaveModulesRequestDto;
import com.skapp.enterprise.common.service.ModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/ep/module")
public class ModuleController {

	private final ModuleService moduleService;

	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	public ResponseEntity<ResponseEntityDto> saveModules(@RequestBody SaveModulesRequestDto saveModulesRequestDto) {
		ResponseEntityDto response = moduleService.saveModules(saveModulesRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping
	public ResponseEntity<ResponseEntityDto> getActiveModules() {
		ResponseEntityDto response = moduleService.getActiveModules();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/has-selected")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	public ResponseEntity<ResponseEntityDto> hasSelectedModules() {
		ResponseEntityDto response = moduleService.hasSelectedModules();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
