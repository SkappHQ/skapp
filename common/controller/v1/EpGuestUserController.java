package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserInviteRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserReInviteRequestDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseDto;
import com.skapp.enterprise.people.service.EpGuestUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/internal/v1/ep/users/guest")
public class EpGuestUserController {

	private final EpGuestUserService epGuestUserService;

	@PostMapping("/invite")
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<EpUserResponseDto> saveAndInviteGuestUser(
			@RequestBody EpGuestUserInviteRequestDto epGuestUserInviteRequestDto) {
		EpUserResponseDto response = epGuestUserService.saveAndInviteGuestUsers(epGuestUserInviteRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/re-invite")
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<EpUserResponseDto> reInviteGuestUser(
			@RequestBody EpGuestUserReInviteRequestDto epGuestUserReInviteRequestDto) {
		EpUserResponseDto response = epGuestUserService.reInviteGuestUsers(epGuestUserReInviteRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping()
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<List<EpUserResponseDto>> getGuestUsers() {
		List<EpUserResponseDto> response = epGuestUserService.getAllGuestUsers();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PatchMapping("/de-activate")
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<ResponseEntityDto> deActivateGuestUser(@RequestParam String email) {
		ResponseEntityDto response = epGuestUserService.deactivateGuestUser(email);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PatchMapping("/activate")
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<ResponseEntityDto> activateGuestUser(@RequestParam String email) {
		ResponseEntityDto response = epGuestUserService.activateGuestUser(email);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@DeleteMapping()
	@PreAuthorize("hasAnyRole('ROLE_INTERNAL_API')")
	public ResponseEntity<ResponseEntityDto> deleteGuestUser(@RequestParam String email) {
		ResponseEntityDto response = epGuestUserService.deleteGuestUser(email);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
