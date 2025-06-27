package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.service.AmazonCloudFrontService;
import com.skapp.enterprise.esignature.payload.response.CfSignedCookieResponseDto;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/cf")
public class AmazonCloudFrontController {

	private final AmazonCloudFrontService amazonCloudFrontService;

	@Value("${aws.cloudfront.sign-cookies-expiration}")
	private int signCookiesExpiration;

	@Value("${aws.cloudfront.s3-default.domain-name}")
	private String cloudFrontDomain;

	@PreAuthorize("hasAnyRole('ROLE_ESIGN_EMPLOYEE')")
	@GetMapping(value = "/document/cookies", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> setCloudFrontCookiesDocument(HttpServletResponse response) {
		try {

			Map<String, String> cookies = amazonCloudFrontService.generateCloudFrontDocumentSignedCookies();

			cookies.forEach((name, value) -> {
				Cookie cookie = getCookieAttributes(value);
				cookie.setPath("/envelop/process/documents");
				response.addCookie(cookie);
			});

			CfSignedCookieResponseDto cfSignedCookieResponseDto = new CfSignedCookieResponseDto();
			cfSignedCookieResponseDto.setExpiresAt(signCookiesExpiration);

			return new ResponseEntity<>(new ResponseEntityDto(false, cfSignedCookieResponseDto), HttpStatus.OK);
		}
		catch (Exception e) {
			return new ResponseEntity<>(new ResponseEntityDto(true, "Failed to set signed cookies"),
					HttpStatus.BAD_REQUEST);
		}
	}

	@PreAuthorize("hasAnyRole('ROLE_ESIGN_EMPLOYEE')")
	@GetMapping(value = "/signature/cookies", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> setCloudFrontCookiesMySignature(HttpServletResponse response) {
		try {

			Map<String, String> cookies = amazonCloudFrontService.generateCloudFrontSignatureSignedCookies();

			cookies.forEach((name, value) -> {
				Cookie cookie = getCookieAttributes(value);
				cookie.setPath("/envelop/document/signature/original");
				response.addCookie(cookie);
			});

			CfSignedCookieResponseDto cfSignedCookieResponseDto = new CfSignedCookieResponseDto();
			cfSignedCookieResponseDto.setExpiresAt(signCookiesExpiration);

			return new ResponseEntity<>(new ResponseEntityDto(false, cfSignedCookieResponseDto), HttpStatus.OK);
		}
		catch (Exception e) {
			return new ResponseEntity<>(new ResponseEntityDto(true, "Failed to set signed cookies"),
					HttpStatus.BAD_REQUEST);
		}
	}

	private Cookie getCookieAttributes(String value) {
		String[] parts = value.split("=", 2);
		String nameAttr = parts[0];
		String valueAttr = parts.length > 1 ? parts[1] : "";
		Cookie cookie = new Cookie(nameAttr, valueAttr);
		cookie.setHttpOnly(true);
		cookie.setSecure(true);
		cookie.setDomain(cloudFrontDomain);
		cookie.setMaxAge(signCookiesExpiration);
		return cookie;
	}

}
