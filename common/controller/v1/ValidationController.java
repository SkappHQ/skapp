package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.EmailValidationRequestDto;
import com.skapp.enterprise.common.service.ValidationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/validate")
public class ValidationController {

	private final ValidationService validationService;

	@PostMapping("/email")
	public ResponseEntity<ResponseEntityDto> validateEmail(
			@Valid @RequestBody EmailValidationRequestDto emailValidationRequestDto) {
		ResponseEntityDto response = validationService.validateBusinessEmail(emailValidationRequestDto.getEmail());
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
