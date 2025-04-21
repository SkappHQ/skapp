package com.skapp.enterprise.common.controller.v2;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.EpGoogleAuthRedirectDto;
import com.skapp.enterprise.common.payload.request.EpGoogleConsentUrlDto;
import com.skapp.enterprise.common.payload.v2.request.EpSignInGoogleDataDto;
import com.skapp.enterprise.common.payload.v2.request.EpSignUpGoogleDataDto;
import com.skapp.enterprise.common.service.v2.EpAuthServiceV2;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v2/ep/auth")
public class EpAuthControllerV2 {

	private final EpAuthServiceV2 epAuthServiceV2;

	@PostMapping("/signup/super-admin/sso/google")
	public ResponseEntity<ResponseEntityDto> ssoGoogleSignUp(
			@Valid @RequestBody EpSignUpGoogleDataDto epSignUpGoogleDataDto) {
		ResponseEntityDto response = epAuthServiceV2.ssoGoogleSignUp(epSignUpGoogleDataDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@PostMapping("/signin/sso/google")
	public ResponseEntity<ResponseEntityDto> ssoGoogleSignIn(
			@Valid @RequestBody EpSignInGoogleDataDto epSignUpGoogleDataDto) {
		ResponseEntityDto response = epAuthServiceV2.ssoGoogleSignIn(epSignUpGoogleDataDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	// Endpoint to handle redirection from Google after authentication
	@GetMapping(value = "/sso/google/redirect", produces = MediaType.APPLICATION_JSON_VALUE)
	public RedirectView ssoGoogleSignInRedirect(@Valid EpGoogleAuthRedirectDto epGoogleAuthRedirectDto) {
		return new RedirectView(epAuthServiceV2.ssoGoogleSignInRedirect(epGoogleAuthRedirectDto));
	}

	@PostMapping(value = "/sso/google/auth-url", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getGoogleAuthUrl(
			@Valid @RequestBody EpGoogleConsentUrlDto epGoogleConsentUrlDto) {
		ResponseEntityDto response = epAuthServiceV2.getGoogleAuthUrl(epGoogleConsentUrlDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
