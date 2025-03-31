package com.skapp.enterprise.common.service.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.EpGoogleAuthRedirectDto;
import com.skapp.enterprise.common.payload.request.EpGoogleConsentUrlDto;
import com.skapp.enterprise.common.payload.v2.request.EpSignInGoogleDataDto;
import com.skapp.enterprise.common.payload.v2.request.EpSignUpGoogleDataDto;
import jakarta.validation.Valid;

public interface EpAuthServiceV2 {

	ResponseEntityDto ssoGoogleSignUp(@Valid EpSignUpGoogleDataDto superAdminSignUpRequestDto);

	ResponseEntityDto ssoGoogleSignIn(@Valid EpSignInGoogleDataDto epSignUpGoogleDataDto);

	String ssoGoogleSignInRedirect(@Valid EpGoogleAuthRedirectDto epGoogleAuthRedirectDto);

	ResponseEntityDto getGoogleAuthUrl(@Valid EpGoogleConsentUrlDto epGoogleConsentUrlDto);

}
