package com.skapp.community.common.controller.v1;

import com.skapp.community.common.payload.request.TestEmailServerRequestDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/email")
public class EmailController {

	private final EmailService emailService;

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	@PostMapping("/test")
	public ResponseEntity<ResponseEntityDto> testEmailServer(
			@RequestBody TestEmailServerRequestDto testEmailServerRequestDto) {
		emailService.testEmailServer(testEmailServerRequestDto);
		return new ResponseEntity<>(HttpStatus.OK);
	}

}
