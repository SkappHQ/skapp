package com.skapp.enterprise.common.service.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.EpGoogleAuthRedirectDto;
import com.skapp.enterprise.common.payload.request.EpGoogleConsentUrlDto;
import com.skapp.enterprise.common.payload.request.EpMicrosoftAuthRedirectDto;
import com.skapp.enterprise.common.payload.request.EpMicrosoftConsentUrlDto;
import com.skapp.enterprise.common.payload.v2.request.EpSignInGoogleDataDto;
import com.skapp.enterprise.common.payload.v2.request.EpSignInMicrosoftDataDto;
import com.skapp.enterprise.common.payload.v2.request.EpSignUpGoogleDataDto;
import com.skapp.enterprise.common.payload.v2.request.EpSignUpMicrosoftDataDto;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

public interface EpAuthServiceV2 {

	ResponseEntityDto ssoGoogleSignUp(@Valid EpSignUpGoogleDataDto superAdminSignUpRequestDto);

	ResponseEntityDto ssoGoogleSignIn(@Valid EpSignInGoogleDataDto epSignUpGoogleDataDto);

	ResponseEntityDto ssoGoogleSignInWithCookie(@Valid EpSignInGoogleDataDto epSignUpGoogleDataDto,
			HttpServletResponse response);

	String ssoGoogleSignInRedirect(@Valid EpGoogleAuthRedirectDto epGoogleAuthRedirectDto);

	ResponseEntityDto getGoogleAuthUrl(@Valid EpGoogleConsentUrlDto epGoogleConsentUrlDto);

	ResponseEntityDto getMicrosoftAuthUrl(@Valid EpMicrosoftConsentUrlDto epMicrosoftConsentUrlDto);

	String ssoMicrosoftSignInRedirect(@Valid EpMicrosoftAuthRedirectDto epMicrosoftAuthRedirectDto);

	ResponseEntityDto ssoMicrosoftSignUp(@Valid EpSignUpMicrosoftDataDto epSignUpMicrosoftDataDto);

	ResponseEntityDto ssoMicrosoftSignIn(@Valid EpSignInMicrosoftDataDto epSignUpMicrosoftDataDto);

	ResponseEntityDto ssoMicrosoftSignInWithCookie(@Valid EpSignInMicrosoftDataDto epSignUpMicrosoftDataDto,
			HttpServletResponse response);

}
