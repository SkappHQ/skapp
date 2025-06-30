package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.service.AmazonCloudFrontService;
import com.skapp.enterprise.esignature.payload.response.CfSignedCookieResponseDto;
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

import static com.skapp.enterprise.esignature.util.EsignUtil.buildSetCookieHeader;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/cf")
public class AmazonCloudFrontController {

	public static final String SET_COOKIE = "Set-Cookie";

	public static final String DOCUMENT_PATH = "/envelop/process/documents";

	public static final String SIGNATURE_PATH = "/envelop/document/signature/original";

	public static final String COOKIE_DOMAIN = ".skapp.dev";

	private final AmazonCloudFrontService amazonCloudFrontService;

	@Value("${aws.cloudfront.sign-cookies-expiration}")
	private int signCookiesExpiration;

	@Value("${aws.cloudfront.s3-default.domain-name}")
	private String cloudFrontDomain;

	@PreAuthorize("hasAnyRole('ROLE_ESIGN_EMPLOYEE')")
	@GetMapping(value = "/cookies/document", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> setCloudFrontCookiesDocument(HttpServletResponse response) {
		try {

			Map<String, String> cookies = amazonCloudFrontService.generateCloudFrontDocumentSignedCookies();

			cookies.forEach((name, value) -> {
				String cookieHeader = buildSetCookieHeader(value, signCookiesExpiration, COOKIE_DOMAIN, DOCUMENT_PATH);
				response.addHeader(SET_COOKIE, cookieHeader);
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
	@GetMapping(value = "/cookies/signature", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> setCloudFrontCookiesMySignature(HttpServletResponse response) {
		try {

			Map<String, String> cookies = amazonCloudFrontService.generateCloudFrontSignatureSignedCookies();

			cookies.forEach((name, value) -> {
				String cookieHeader = buildSetCookieHeader(value, signCookiesExpiration, COOKIE_DOMAIN, SIGNATURE_PATH);
				response.addHeader(SET_COOKIE, cookieHeader);
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

}
