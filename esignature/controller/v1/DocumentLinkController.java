package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.ResendAccessUrlDto;
import com.skapp.enterprise.esignature.payload.request.verification.RecipientConvertToOtpRequestDto;
import com.skapp.enterprise.esignature.payload.request.verification.RecipientConvertToOtpValidateRequestDto;
import com.skapp.enterprise.esignature.payload.request.verification.UuidConvertToOtpRequestDto;
import com.skapp.enterprise.esignature.payload.request.verification.UuidConvertToOtpValidateRequestDto;
import com.skapp.enterprise.esignature.service.DocumentLinkService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/ep/esign/document-link")
public class DocumentLinkController {

	private final DocumentLinkService documentLinkService;

	@Operation(summary = "Create  sign or view document access link",
			description = "Generates a document access link which can view or sign for the given document Id and recipient Id")
	@PostMapping(value = "/resend", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> resendDocumentAccessURL(
			@Valid @RequestBody ResendAccessUrlDto resendAccessUrlDto) {

		documentLinkService.resendDocumentAccessURL(resendAccessUrlDto);

		return new ResponseEntity<>(new ResponseEntityDto(false, "Email successfully resent to the recipient"),
				HttpStatus.CREATED);
	}

	@Operation(summary = "Get data for sign or view link",
			description = "Fetches the sign or view related data for a given document and recipient using a document access token.")
	@PostMapping(value = "/access", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS','ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getRecipientDocumentData(@RequestParam Long documentId,
			@RequestParam Long recipientId) {

		ResponseEntityDto responseEntityDto = documentLinkService.getRecipientDocumentData(documentId, recipientId,
				true);

		return new ResponseEntity<>(responseEntityDto, HttpStatus.OK);
	}

	@Operation(summary = "Retrieve Data for Internal Document Access",
			description = "Retrieves data required for signing or viewing a document internally for a given document and recipient, using internal access privileges.")
	@PostMapping(value = "/internal/access", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getRecipientDocumentDataInternal(@RequestParam Long documentId,
			@RequestParam Long recipientId) {

		ResponseEntityDto responseEntityDto = documentLinkService.getRecipientDocumentData(documentId, recipientId,
				false);

		return new ResponseEntity<>(responseEntityDto, HttpStatus.OK);
	}

	@Operation(summary = "Send OTP for a given uuid",
			description = "Sends an OTP to the recipient associated with the provided UUID for document access. "
					+ "The OTP is sent only if MFA is enabled for the recipient.")
	@PostMapping(value = "/send-otp", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> sendOtpFromUuid(
			@Valid @RequestBody UuidConvertToOtpRequestDto uuidConvertToOtpRequestDto) {

		ResponseEntityDto responseEntityDto = documentLinkService.sendOtpFromUuid(uuidConvertToOtpRequestDto);

		return new ResponseEntity<>(responseEntityDto, HttpStatus.OK);
	}

	@Operation(summary = "Send OTP for a given document and recipient",
			description = "Sends an OTP to the recipient associated with the provided documentId and recipientId for document access. "
					+ "The OTP is sent only if MFA is enabled for the recipient.")
	@PostMapping(value = "/internal/send-otp", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> sendOtpFromDocumentAndRecipientId(
			@Valid @RequestBody RecipientConvertToOtpRequestDto recipientConvertToOtpRequestDto) {

		ResponseEntityDto responseEntityDto = documentLinkService
			.sendOtpFromDocumentAndRecipientId(recipientConvertToOtpRequestDto);

		return new ResponseEntity<>(responseEntityDto, HttpStatus.OK);
	}

	@Operation(summary = "Exchange OTP for Document Access Token",
			description = "Exchanges OTP for an internal access token used to sign or view a document. "
					+ "The token is only returned if the otp is successfully verified and the document link is available.")
	@PostMapping(value = "/verify-otp", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> verifyOtpFromUuid(
			@Valid @RequestBody UuidConvertToOtpValidateRequestDto uuidConvertToOtpValidateRequestDto) {

		ResponseEntityDto responseEntityDto = documentLinkService.verifyOtpFromUuid(uuidConvertToOtpValidateRequestDto);

		return new ResponseEntity<>(responseEntityDto, HttpStatus.OK);
	}

	@Operation(summary = "Retrieve Data for Internal Document Access",
			description = "Retrieves data required for signing or viewing a document internally for a given document and recipient, using internal access privileges.")
	@PostMapping(value = "/internal/access/verify-otp", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> verifyOtpFromDocumentAndRecipientId(
			@Valid @RequestBody RecipientConvertToOtpValidateRequestDto recipientConvertToOtpValidateRequestDto) {

		ResponseEntityDto responseEntityDto = documentLinkService
			.verifyOtpFromDocumentAndRecipientId(recipientConvertToOtpValidateRequestDto);

		return new ResponseEntity<>(responseEntityDto, HttpStatus.OK);
	}

	@Operation(summary = "Resend OTP for a given uuid",
			description = "Resends an OTP to the recipient associated with the provided UUID for document access. "
					+ "The OTP is sent only if MFA is enabled for the recipient.")
	@PostMapping(value = "/resend-otp", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> resendOtpFromUuid(
			@Valid @RequestBody UuidConvertToOtpRequestDto uuidConvertToOtpRequestDto) {

		ResponseEntityDto responseEntityDto = documentLinkService.resendOtpFromUuid(uuidConvertToOtpRequestDto, true);

		return new ResponseEntity<>(responseEntityDto, HttpStatus.OK);
	}

	@Operation(summary = "Resend OTP for a given document and recipient",
			description = "Resends an OTP to the recipient associated with the provided Document Id and Recipient Id for document access. "
					+ "The OTP is sent only if MFA is enabled for the recipient.")
	@PostMapping(value = "/internal/resend-otp", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> resendOtpForInternalUser(
			@Valid @RequestBody RecipientConvertToOtpRequestDto recipientConvertToOtpRequestDto) {

		ResponseEntityDto responseEntityDto = documentLinkService
			.resendOtpFromDocumentAndRecipientId(recipientConvertToOtpRequestDto, true);

		return new ResponseEntity<>(responseEntityDto, HttpStatus.OK);
	}

	@Operation(summary = "Retrieve Verification Data for Internal Document Access",
			description = "Retrieves verification data required for signing or viewing a document internally for a given document and recipient, using internal access privileges.")
	@GetMapping(value = "/internal/access/verification-check", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getRecipientDocumentVerificationDataInternal(@RequestParam Long documentId,
			@RequestParam Long recipientId) {

		ResponseEntityDto responseEntityDto = documentLinkService.getRecipientDocumentVerificationData(documentId,
				recipientId);

		return new ResponseEntity<>(responseEntityDto, HttpStatus.OK);
	}

	@Operation(summary = "Exchange UUID for Document Access Token",
			description = "Exchanges a decrypted and validated UUID for an internal access token used to sign or view a document. "
					+ "The token is only returned if the document link is available.")
	@GetMapping(value = "/token-exchange", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getTokenFromUuid(@RequestParam String uuid, @RequestParam String state) {

		ResponseEntityDto responseEntityDto = documentLinkService.getTokenFromUuid(uuid, state);

		return new ResponseEntity<>(responseEntityDto, HttpStatus.OK);
	}

	@Operation(summary = "Check Resend Status of Document Access Token",
			description = "Retrieves the current resend status of a document access token.")
	@GetMapping(value = "/token/resend-status", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getTokenResendStatus(@RequestParam String token) {

		ResponseEntityDto responseEntityDto = documentLinkService.getTokenResendStatus(token);

		return new ResponseEntity<>(responseEntityDto, HttpStatus.OK);
	}

}
