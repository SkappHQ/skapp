package com.skapp.enterprise.pm.controller.v1;

import com.skapp.enterprise.common.payload.request.EpGuestUserBulkInviteRequestDto;
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

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/v1/ep/user/guest")
public class EpGuestUserInternalController {

	private final EpGuestUserService epGuestUserService;

	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<List<EpUserResponseDto>> createGuestUser(
			@RequestBody EpGuestUserBulkInviteRequestDto epGuestUserBulkInviteRequestDto) {
		List<EpUserResponseDto> response = epGuestUserService.createGuestUsers(epGuestUserBulkInviteRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
