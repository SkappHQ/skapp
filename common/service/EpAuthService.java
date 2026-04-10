package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.request.SuperAdminSignUpRequestDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.CodeChallengeRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserOtpVerifyRequestDto;
import com.skapp.enterprise.common.payload.request.EpGuestUserSignInRequestDto;
import com.skapp.enterprise.common.payload.request.EpPasswordResetDto;
import com.skapp.enterprise.common.payload.request.EpPasswordResetNewPasswordDto;
import com.skapp.enterprise.common.payload.request.EpPasswordResetOtpVerifyDto;
import com.skapp.enterprise.common.payload.request.EpSignInGoogleDataDto;
import com.skapp.enterprise.common.payload.request.EpSignUpGoogleDataDto;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

public interface EpAuthService {

	ResponseEntityDto superAdminSignUp(@Valid SuperAdminSignUpRequestDto superAdminSignUpRequestDto);

	ResponseEntityDto generateAndSendOTP();

	ResponseEntityDto verifyOTP(String otp);

	ResponseEntityDto verifySubDomain(String subDomainName);

	ResponseEntityDto ssoGoogleSignUp(@Valid EpSignUpGoogleDataDto superAdminSignUpRequestDto);

	ResponseEntityDto ssoGoogleSignIn(@Valid EpSignInGoogleDataDto epSignUpGoogleDataDto);

	ResponseEntityDto sendPasswordResetOtp(EpPasswordResetDto epPasswordResetDto);

	ResponseEntityDto validateGuestUserSignInOtp(EpGuestUserOtpVerifyRequestDto epGuestUserOtpVerifyRequestDto);

	ResponseEntityDto validateGuestUserSignInOtpWithCookie(
			EpGuestUserOtpVerifyRequestDto epGuestUserOtpVerifyRequestDto, HttpServletResponse response);

	ResponseEntityDto verifyPasswordResetOTP(EpPasswordResetOtpVerifyDto epPasswordResetOtpVerifyDto);

	ResponseEntityDto resetPassword(EpPasswordResetNewPasswordDto epPasswordResetNewPasswordDto);

	ResponseEntityDto resendVerifyPasswordResetOTP(EpPasswordResetDto epPasswordResetDto);

	ResponseEntityDto verifyTenantAvailability(String subDomainName);

	ResponseEntityDto validateCodeChallenge(CodeChallengeRequestDto codeChallengeRequestDto);

	ResponseEntityDto validateCodeChallengeWithCookie(CodeChallengeRequestDto codeChallengeRequestDto,
			HttpServletResponse response);

	ResponseEntityDto sendGuestUserSignInOtp(EpGuestUserSignInRequestDto epGuestUserSignInRequestDto);

	ResponseEntityDto resendGuestUserSignInOtp(EpGuestUserSignInRequestDto epGuestUserSignInRequestDto);

}
