package com.skapp.enterprise.common.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.AmazonS3DeleteItemRequestDto;
import com.skapp.enterprise.common.payload.request.AmazonS3SignedUrlRequestDto;
import com.skapp.enterprise.common.payload.request.AmazonS3SignedUrlValidatedRequestDto;
import com.skapp.enterprise.common.service.AmazonS3Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/ep/s3")
public class AmazonS3Controller {

	private final AmazonS3Service amazonS3Service;

	@PostMapping("/files/signed-url")
	public ResponseEntity<ResponseEntityDto> getSignedUrl(
			@Valid @RequestBody AmazonS3SignedUrlRequestDto amazonS3SignedUrlRequestDto) {
		ResponseEntityDto response = amazonS3Service.getSignedUrl(amazonS3SignedUrlRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping("/files/organization-setup/signed-url")
	public ResponseEntity<ResponseEntityDto> getOrganizationSetUpSignedUrl(
			@Valid @RequestBody AmazonS3SignedUrlRequestDto amazonS3SignedUrlRequestDto) {
		ResponseEntityDto response = amazonS3Service.getSignedUrl(amazonS3SignedUrlRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@DeleteMapping("/files")
	public ResponseEntity<ResponseEntityDto> deleteFileFromS3(
			@Valid @RequestBody AmazonS3DeleteItemRequestDto amazonS3DeleteItemRequestDto) {
		ResponseEntityDto response = amazonS3Service.deleteFileFromS3(amazonS3DeleteItemRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping(value = "/esign/files/signed-url", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS','ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getPreSignedS3UrlFromEsignToken(
			@Valid @RequestBody AmazonS3SignedUrlRequestDto amazonS3SignedUrlRequestDto) {
		ResponseEntityDto response = amazonS3Service.getSignedUrl(amazonS3SignedUrlRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping(value = "/invoice/files/signed-url", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_INVOICE_ADMIN' , 'ROLE_INVOICE_MANAGER')")
	public ResponseEntity<ResponseEntityDto> getPreSignedS3UrlForInvoice(
			@Valid @RequestBody AmazonS3SignedUrlValidatedRequestDto amazonS3SignedUrlValidatedRequestDto) {
		ResponseEntityDto response = amazonS3Service
			.getSignedUrlWithFileValidations(amazonS3SignedUrlValidatedRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PostMapping(value = "/esign/files/envelope/template/signed-url", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> getPreSignedS3UrlForEsignEnvelopeTemplate(
			@Valid @RequestBody AmazonS3SignedUrlRequestDto amazonS3SignedUrlRequestDto) {
		ResponseEntityDto response = amazonS3Service.getSignedUrlForEnvelopeTemplate(amazonS3SignedUrlRequestDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
