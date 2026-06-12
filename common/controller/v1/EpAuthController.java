package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.request.SuperAdminSignUpRequestDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.common.payload.request.CodeChallengeRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserOtpVerifyRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserSignInRequestDto;
import com.skapp.enterprise.common.payload.request.EpPasswordResetDto;
import com.skapp.enterprise.common.payload.request.EpPasswordResetNewPasswordDto;
import com.skapp.enterprise.common.payload.request.EpPasswordResetOtpVerifyDto;
import com.skapp.enterprise.common.payload.request.EpSignInGoogleDataDto;
import com.skapp.enterprise.common.payload.request.EpSignUpGoogleDataDto;
import com.skapp.enterprise.common.payload.request.OtpVerificationRequestDto;
import com.skapp.enterprise.common.service.EpAuthService;
import com.skapp.enterprise.people.service.EpUserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/auth")
public class EpAuthController {

	private final EpAuthService epAuthService;

	private final EpUserService epUserService;

	@PostMapping("/signup/super-admin")
	public ResponseEntity<ResponseEntityDto> superAdminSignUp(
			@Valid @RequestBody SuperAdminSignUpRequestDto superAdminSignUpRequestDto,
			@RequestHeader(value = EpAuthConstants.RECAPTCHA_BYPASS_SECRET_HEADER,
					required = false) String bypassSecret) {
		ResponseEntityDto response = epAuthService.superAdminSignUp(superAdminSignUpRequestDto, bypassSecret);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PostMapping("/signup/super-admin/sso/google")
	public ResponseEntity<ResponseEntityDto> ssoGoogleSignUp(
			@Valid @RequestBody EpSignUpGoogleDataDto epSignUpGoogleDataDto) {
		ResponseEntityDto response = epAuthService.ssoGoogleSignUp(epSignUpGoogleDataDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PostMapping("/signin/sso/google")
	public ResponseEntity<ResponseEntityDto> ssoGoogleSignIn(
			@Valid @RequestBody EpSignInGoogleDataDto epSignUpGoogleDataDto) {
		ResponseEntityDto response = epAuthService.ssoGoogleSignIn(epSignUpGoogleDataDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/otp/generate")
	public ResponseEntity<ResponseEntityDto> generateOTP() {
		ResponseEntityDto response = epAuthService.generateAndSendOTP();
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PostMapping("/otp/verify")
	public ResponseEntity<ResponseEntityDto> verifyOTP(
			@Valid @RequestBody OtpVerificationRequestDto otpVerificationRequestDto) {
		ResponseEntityDto response = epAuthService.verifyOTP(otpVerificationRequestDto.getOtp());
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/otp/resend")
	public ResponseEntity<ResponseEntityDto> resendOTP() {
		ResponseEntityDto response = epAuthService.generateAndSendOTP();
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PostMapping("/domain/verify")
	public ResponseEntity<ResponseEntityDto> verifySubDomain(@RequestParam String subDomainName) {
		ResponseEntityDto response = epAuthService.verifySubDomain(subDomainName);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/tenant/availability")
	public ResponseEntity<ResponseEntityDto> verifyTenantAvailability(@RequestParam String subDomainName) {
		ResponseEntityDto response = epAuthService.verifyTenantAvailability(subDomainName);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/password-reset")
	public ResponseEntity<ResponseEntityDto> resetPassword(
			@RequestBody EpPasswordResetNewPasswordDto epPasswordResetNewPasswordDto) {
		ResponseEntityDto response = epAuthService.resetPassword(epPasswordResetNewPasswordDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/password-reset/send-otp")
	public ResponseEntity<ResponseEntityDto> sendPasswordResetOtp(@RequestBody EpPasswordResetDto epPasswordResetDto) {
		ResponseEntityDto response = epAuthService.sendPasswordResetOtp(epPasswordResetDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/password-reset/verify-otp")
	public ResponseEntity<ResponseEntityDto> verifyPasswordResetOtp(
			@RequestBody EpPasswordResetOtpVerifyDto epPasswordResetOtpVerifyDto) {
		ResponseEntityDto response = epAuthService.verifyPasswordResetOTP(epPasswordResetOtpVerifyDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/password-reset/resend-otp")
	public ResponseEntity<ResponseEntityDto> resendVerifyPasswordResetOtp(
			@RequestBody EpPasswordResetDto epPasswordResetDto) {
		ResponseEntityDto response = epAuthService.resendVerifyPasswordResetOTP(epPasswordResetDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/code-challenge/verify")
	public ResponseEntity<ResponseEntityDto> validateCodeChallenge(
			@RequestBody CodeChallengeRequestDto codeChallengeRequestDto) {
		ResponseEntityDto response = epAuthService.validateCodeChallenge(codeChallengeRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/session/code-challenge/verify")
	public ResponseEntity<ResponseEntityDto> validateCodeChallengeWithCookie(
			@RequestBody CodeChallengeRequestDto codeChallengeRequestDto, HttpServletResponse httpServletResponse) {
		ResponseEntityDto response = epAuthService.validateCodeChallengeWithCookie(codeChallengeRequestDto,
				httpServletResponse);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/signin/guest/send-otp")
	public ResponseEntity<ResponseEntityDto> sendGuestUserSignInOtp(
			@RequestBody EpGuestUserSignInRequestDto epGuestUserSignInRequestDto) {
		ResponseEntityDto response = epAuthService.sendGuestUserSignInOtp(epGuestUserSignInRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/signin/guest/resend-otp")
	public ResponseEntity<ResponseEntityDto> resendGuestUserSignInOtp(
			@RequestBody EpGuestUserSignInRequestDto epGuestUserSignInRequestDto) {
		ResponseEntityDto response = epAuthService.resendGuestUserSignInOtp(epGuestUserSignInRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/signin/guest/verify-otp")
	public ResponseEntity<ResponseEntityDto> verifyGuestUserSignInOtp(
			@RequestBody EpGuestUserOtpVerifyRequestDto epGuestUserOtpVerifyRequestDto) {
		ResponseEntityDto response = epAuthService.validateGuestUserSignInOtp(epGuestUserOtpVerifyRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/session/signin/guest/verify-otp")
	public ResponseEntity<ResponseEntityDto> verifyGuestUserSignWithCookieInOtp(
			@RequestBody EpGuestUserOtpVerifyRequestDto epGuestUserOtpVerifyRequestDto,
			HttpServletResponse httpServletResponse) {
		ResponseEntityDto response = epAuthService.validateGuestUserSignInOtpWithCookie(epGuestUserOtpVerifyRequestDto,
				httpServletResponse);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/status")
	public ResponseEntity<ResponseEntityDto> getUserStatus(@RequestParam String email) {
		ResponseEntityDto response = epUserService.getUserStatus(email);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
