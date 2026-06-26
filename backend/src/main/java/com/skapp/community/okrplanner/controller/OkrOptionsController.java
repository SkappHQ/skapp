package com.skapp.community.okrplanner.controller;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.okrplanner.service.OkrOptionsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/okr/options")
@Tag(name = "OKR Options Controller", description = "Operations related to objectives and key results options")
public class OkrOptionsController {

	private final OkrOptionsService okrOptionsService;

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_OKR_ADMIN')")
	@GetMapping("/okr-frequency")
	public ResponseEntity<ResponseEntityDto> getOkrFrequency() {
		ResponseEntityDto response = new ResponseEntityDto(false, okrOptionsService.getOkrFrequency());
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_OKR_ADMIN')")
	@GetMapping("/okr-company-objective-time")
	public ResponseEntity<ResponseEntityDto> getOkrCompanyObjectiveTime() {
		ResponseEntityDto response = new ResponseEntityDto(false, okrOptionsService.getOkrCompanyObjectiveTime());
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
