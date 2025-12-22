package com.skapp.community.common.service;

import com.skapp.community.common.payload.request.ChangePasswordRequestDto;
import com.skapp.community.common.payload.request.ForgotPasswordRequestDto;
import com.skapp.community.common.payload.request.ReInvitationRequestDto;
import com.skapp.community.common.payload.request.RefreshTokenRequestDto;
import com.skapp.community.common.payload.request.ResetPasswordRequestDto;
import com.skapp.community.common.payload.request.SignInRequestDto;
import com.skapp.community.common.payload.request.SuperAdminSignUpRequestDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {

	ResponseEntityDto signIn(SignInRequestDto signInRequestDto);

	ResponseEntityDto signInWithCookie(SignInRequestDto signInRequestDto, HttpServletResponse response);

	ResponseEntityDto superAdminSignUp(SuperAdminSignUpRequestDto superAdminSignUpRequestDto);

	ResponseEntityDto refreshAccessToken(RefreshTokenRequestDto refreshTokenRequestDto);

	ResponseEntityDto employeeResetPassword(ResetPasswordRequestDto resetPasswordRequestDto);

	ResponseEntityDto sharePassword(Long userId);

	ResponseEntityDto resetAndSharePassword(Long userId);

	ResponseEntityDto sendReInvitation(ReInvitationRequestDto reInvitationRequestDto);

	ResponseEntityDto forgotPassword(ForgotPasswordRequestDto forgotPasswordRequestDto);

	ResponseEntityDto changePassword(ChangePasswordRequestDto changePasswordRequestDto, Long userId);

}
