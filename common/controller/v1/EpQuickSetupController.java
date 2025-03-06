package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.service.EpQuickSetupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/ep/quick-setup-progress")
public class EpQuickSetupController {

	private final EpQuickSetupService epQuickSetupService;

	@GetMapping
	public ResponseEntity<ResponseEntityDto> getQuickSetupProgress() {
		ResponseEntityDto response = epQuickSetupService.getQuickSetupProgress();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
