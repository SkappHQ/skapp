package com.skapp.enterprise.pm.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.payload.request.EpGuestUserApprovalRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserInviteRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserReInviteRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserUpdateRequestDto;
import com.skapp.enterprise.common.payload.response.EpUserResponseDto;
import com.skapp.enterprise.pm.payload.EpGuestUserRequestResponseDto;
import com.skapp.enterprise.pm.payload.EpGuestUserResponseDto;
import com.skapp.enterprise.pm.payload.GuestInvitationValidationResponseDto;
import com.skapp.enterprise.pm.service.EpGuestUserService;
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
@RequestMapping("/v1/ep/user/guest")
public class EpGuestUserController {

	private final EpGuestUserService epGuestUserService;

	@PostMapping
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PM_ADMIN')")
	public ResponseEntity<ResponseEntityDto> createGuestUser(
			@RequestBody EpGuestUserInviteRequestDto epGuestUserInviteRequestDto) {
		ResponseEntityDto response = epGuestUserService.createGuestUser(epGuestUserInviteRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PatchMapping
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PM_ADMIN')")
	public ResponseEntity<EpUserResponseDto> updateGuestUser(
			@RequestBody EpGuestUserUpdateRequestDto epGuestUserUpdateRequestDto) {
		EpUserResponseDto response = epGuestUserService.updateGuestUser(epGuestUserUpdateRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PM_ADMIN')")
	public ResponseEntity<List<EpGuestUserResponseDto>> getAllGuestUsers(@RequestParam(required = false) String email,
			@RequestParam(required = false) List<AccountStatus> statuses,
			@RequestParam(required = false) List<Long> projectIds) {
		List<EpGuestUserResponseDto> response = epGuestUserService.getAllGuestUsers(email, statuses, projectIds);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/requests")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PM_ADMIN')")
	public ResponseEntity<List<EpGuestUserRequestResponseDto>> getPendingGuestUserRequests(
			@RequestParam(required = false) String email) {
		List<EpGuestUserRequestResponseDto> response = epGuestUserService.getPendingGuestUserRequests(email);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/re-invite")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PM_ADMIN')")
	public ResponseEntity<EpUserResponseDto> reInviteGuestUser(
			@RequestBody EpGuestUserReInviteRequestDto epGuestUserReInviteRequestDto) {
		EpUserResponseDto response = epGuestUserService.reInviteGuestUsers(epGuestUserReInviteRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PatchMapping("/de-activate")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PM_ADMIN')")
	public ResponseEntity<ResponseEntityDto> deActivateGuestUser(@RequestParam Long id) {
		ResponseEntityDto response = epGuestUserService.deactivateGuestUser(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PatchMapping("/activate")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PM_ADMIN')")
	public ResponseEntity<ResponseEntityDto> activateGuestUser(@RequestParam Long id) {
		ResponseEntityDto response = epGuestUserService.activateGuestUser(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PatchMapping("/approval")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PM_ADMIN')")
	public ResponseEntity<ResponseEntityDto> updateGuestUserApprovalStatus(
			@RequestBody EpGuestUserApprovalRequestDto epGuestUserApprovalRequestDto) {
		ResponseEntityDto response = epGuestUserService.updateGuestUserApprovalStatus(epGuestUserApprovalRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@DeleteMapping()
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PM_ADMIN')")
	public ResponseEntity<ResponseEntityDto> deleteGuestUser(@RequestParam Long id) {
		ResponseEntityDto response = epGuestUserService.deleteGuestUser(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/pending/count")
	@PreAuthorize("hasAnyRole('ROLE_PM_ADMIN')")
	public ResponseEntity<ResponseEntityDto> getPendingGuestUsersCount() {
		ResponseEntityDto response = epGuestUserService.getPendingGuestUsersCount();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/validate")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PM_ADMIN')")
	public ResponseEntity<List<GuestInvitationValidationResponseDto>> validateGuestInvitations(
			@RequestParam List<String> emails, @RequestParam(required = false) Long projectId) {
		List<GuestInvitationValidationResponseDto> response = epGuestUserService.validateGuestInvitations(emails,
				projectId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
