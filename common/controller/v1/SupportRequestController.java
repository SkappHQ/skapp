package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.ApplySupportRequestDto;
import com.skapp.enterprise.common.service.SupportRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/support")
public class SupportRequestController {

	private final SupportRequestService supportRequestService;

	@PostMapping()
	public ResponseEntity<ResponseEntityDto> applySupportRequest(
			@RequestBody @Valid ApplySupportRequestDto applySupportRequestDto) {
		ResponseEntityDto response = supportRequestService.applySupportRequest(applySupportRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

}