package com.skapp.enterprise.pm.controller.v1;

import com.skapp.enterprise.common.payload.request.EpGuestUserInviteRequestDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseDto;
import com.skapp.enterprise.pm.service.EpGuestUserService;
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
@RequestMapping("/internal/v1/ep/user/guest")
public class EpGuestUserInternalController {

	private final EpGuestUserService epGuestUserService;

	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<EpUserResponseDto> createGuestUser(
			@RequestBody EpGuestUserInviteRequestDto epGuestUserInviteRequestDto) {
		EpUserResponseDto response = epGuestUserService.createGuestUser(epGuestUserInviteRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
