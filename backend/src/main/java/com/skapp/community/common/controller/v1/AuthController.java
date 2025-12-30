package com.skapp.community.common.controller.v1;

import com.skapp.community.common.payload.request.ChangePasswordRequestDto;
import com.skapp.community.common.payload.request.ForgotPasswordRequestDto;
import com.skapp.community.common.payload.request.ReInvitationRequestDto;
import com.skapp.community.common.payload.request.RefreshTokenRequestDto;
import com.skapp.community.common.payload.request.ResetPasswordRequestDto;
import com.skapp.community.common.payload.request.SignInRequestDto;
import com.skapp.community.common.payload.request.SuperAdminSignUpRequestDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/auth")
@Tag(name = "Auth Controller", description = "Endpoints for authentication")
public class AuthController {

	private final AuthService authService;

	@Operation(summary = "Sign In", description = "Sign in to the application")
	@PostMapping(value = "/sign-in", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> signIn(@Valid @RequestBody SignInRequestDto signInRequestDto) {
		ResponseEntityDto response = authService.signIn(signInRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Sign In with Cookie", description = "Sign in to the application with HTTP-only cookie")
	@PostMapping(value = "/cookie/sign-in", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> signInWithCookie(@Valid @RequestBody SignInRequestDto signInRequestDto,
			HttpServletResponse response) {
		ResponseEntityDto authResponse = authService.signInWithCookie(signInRequestDto, response);
		return new ResponseEntity<>(authResponse, HttpStatus.OK);
	}

	@Operation(summary = "Super Admin Sign Up", description = "Sign up as a super admin")
	@PostMapping(value = "/signup/super-admin", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> superAdminSignUp(
			@Valid @RequestBody SuperAdminSignUpRequestDto superAdminSignUpRequestDto) {
		ResponseEntityDto response = authService.superAdminSignUp(superAdminSignUpRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Get Access Token Using Refresh Token",
			description = "Obtain a new access token using a refresh token")
	@PostMapping(value = "/refresh-token", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> refreshAccessToken(
			@Valid @RequestBody RefreshTokenRequestDto refreshTokenRequestDto) {
		ResponseEntityDto response = authService.refreshAccessToken(refreshTokenRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get Access Token from Cookie",
			description = "Obtain a new access token using refresh token from cookie")
	@PostMapping(value = "/cookie/refresh-token", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> refreshAccessTokenFromCookie(
			@CookieValue(value = "refreshToken") String refreshToken) {
		RefreshTokenRequestDto refreshTokenRequestDto = new RefreshTokenRequestDto();
		refreshTokenRequestDto.setRefreshToken(refreshToken);
		ResponseEntityDto response = authService.refreshAccessToken(refreshTokenRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Reset password", description = "Reset password")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PEOPLE_EMPLOYEE')")
	@PostMapping(value = "/reset-password", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> employeeResetPassword(
			@Valid @RequestBody ResetPasswordRequestDto resetPasswordRequestDto) {
		ResponseEntityDto response = authService.employeeResetPassword(resetPasswordRequestDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Share password", description = "Share password")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PEOPLE_ADMIN')")
	@GetMapping(value = "/share-password/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> sharePassword(@PathVariable Long userId) {
		ResponseEntityDto response = authService.sharePassword(userId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Re invitation", description = "Invite pending users again")
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PEOPLE_ADMIN')")
	@PostMapping(value = "/re-invitation", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> sendReInvitation(
			@RequestBody ReInvitationRequestDto reInvitationRequestDto) {
		ResponseEntityDto response = authService.sendReInvitation(reInvitationRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_PEOPLE_ADMIN')")
	@GetMapping(value = "/reset/share-password/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> resetAndSharePassword(@PathVariable Long userId) {
		ResponseEntityDto response = authService.resetAndSharePassword(userId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping(value = "/forgot/password", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> forgotPassword(@Valid ForgotPasswordRequestDto forgotPasswordRequestDto) {
		ResponseEntityDto response = authService.forgotPassword(forgotPasswordRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasAnyRole('ROLE_PEOPLE_EMPLOYEE')")
	@PatchMapping(value = "/change/password/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> changePassword(@PathVariable Long userId,
			@RequestBody ChangePasswordRequestDto changePasswordRequestDto) {
		ResponseEntityDto response = authService.changePassword(changePasswordRequestDto, userId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
