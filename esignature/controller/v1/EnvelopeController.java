package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.DeclineEnvelopeRequestDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeDetailDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeInboxFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeNextFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeSentFilterDto;
import com.skapp.enterprise.esignature.payload.request.EnvelopeUpdateDto;
import com.skapp.enterprise.esignature.payload.request.VoidEnvelopeRequestDto;
import com.skapp.enterprise.esignature.service.EnvelopeService;
import com.skapp.enterprise.esignature.util.EsignUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("v1/ep/esign/envelopes")
public class EnvelopeController {

	private final EnvelopeService envelopeService;

	@Operation(summary = "Create a new envelope",
			description = "This endpoint creates a new envelope with the provided details.")
	@PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_ADMIN', 'ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> createNewEnvelope(
			@Valid @RequestBody EnvelopeDetailDto envelopeDetailDto) {
		ResponseEntityDto response = envelopeService.createNewEnvelope(envelopeDetailDto);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Update an envelope", description = "This endpoint updates an existing envelope by it's ID.")
	@PatchMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_ADMIN', 'ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> updateEnvelope(
			@PathVariable @Schema(description = "ID of the employee to update", example = "1") Long id,
			@Valid @RequestBody EnvelopeUpdateDto envelopeUpdateDto) {
		ResponseEntityDto response = envelopeService.updateEnvelope(id, envelopeUpdateDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get Employee Need To Sign KPI Values",
			description = "This endpoint returns the count of envelopes that need to be signed by a specific employee.")
	@GetMapping(value = "need-to-sign/{id}/count", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getEmployeeNeedToSignEnvelopeCount(
			@PathVariable @Schema(description = "ID of the employee to get count") Long id) {
		ResponseEntityDto response = envelopeService.getEmployeeNeedToSignEnvelopeCount(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get paginated envelopes received to current user",
			description = "Returns a paginated list of envelopes received to current user(inbox), including subject, "
					+ "sender email, status, expiry date, and received date. Supports filtering by envelope status, "
					+ "searching by subject or sender email, and sorting by expire and received dates.")
	@GetMapping(value = "/inbox/me", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getAllUserEnvelopes(@Valid EnvelopeInboxFilterDto envelopeInboxFilterDto) {
		ResponseEntityDto response = envelopeService.getAllUserEnvelopes(envelopeInboxFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get paginated envelopes received to given user id",
			description = "Returns a paginated list of envelopes received to given user id(inbox), including subject, "
					+ "sender email, status, expiry date, and received date. Supports filtering by envelope status, "
					+ "searching by subject or sender email, and sorting by expire and received dates.")
	@GetMapping(value = "/inbox/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN')")
	public ResponseEntity<ResponseEntityDto> getAllUserEnvelopesByUserId(
			@Valid EnvelopeInboxFilterDto envelopeInboxFilterDto, @PathVariable Long userId) {
		ResponseEntityDto response = envelopeService.getAllUserEnvelopesByUserId(envelopeInboxFilterDto, userId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get paginated list of sent envelopes",
			description = "Returns a paginated list of envelopes sent by the current user or by all users")
	@GetMapping(value = "/sent/me", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ESIGN_ADMIN', 'ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> getAllSentEnvelopes(@Valid EnvelopeSentFilterDto envelopeSentFilterDto) {
		ResponseEntityDto response = envelopeService.getAllSentEnvelopes(envelopeSentFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get Sender's Basic KPI Values",
			description = "Returns the count of envelopes sent by the sender that are either completed or waiting to be signed.")
	@GetMapping(value = "sender/basic/analytics", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getSenderKPI() {
		ResponseEntityDto response = envelopeService.getSenderKPI();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get envelope details assigned to the current employee",
			description = "Returns the details of the envelope assigned to the currently logged-in employee for signing. Accessible only by users with the ESIGN_EMPLOYEE role.")
	@GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getEnvelopeForCurrentUser(
			@PathVariable @Schema(description = "ID of the envelope to get") Long id) {
		ResponseEntityDto response = envelopeService.getEnvelopeForCurrentUser(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get envelope details created by the current sender",
			description = "Returns the details of the envelope created or sent by the currently logged-in user.")
	@GetMapping(value = "envelope-sender/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> getEnvelopeForSender(
			@PathVariable @Schema(description = "ID of the envelope to get") Long id) {
		ResponseEntityDto response = envelopeService.getEnvelopeForSender(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get Signature Certificate (PDF)",
			description = "This endpoint retrieves the signature certificate PDF for a given envelope ID.")
	@GetMapping(value = "/internal/signature-certificate", produces = MediaType.APPLICATION_PDF_VALUE)
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<byte[]> getSignatureCertificateInternal(@RequestParam Long envelopeId) {
		HttpHeaders headers = new HttpHeaders();
		byte[] pdfBytes = envelopeService.getSignatureCertificate(envelopeId, headers, false);
		return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
	}

	@Operation(summary = "Get Signature Certificate (PDF)",
			description = "This endpoint retrieves the signature certificate PDF for a given envelope ID.")
	@GetMapping(value = "/signature-certificate", produces = MediaType.APPLICATION_PDF_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS','ESIGN_EMPLOYEE')")
	public ResponseEntity<byte[]> getSignatureCertificateExternal(@RequestParam Long envelopeId) {
		HttpHeaders headers = new HttpHeaders();
		byte[] pdfBytes = envelopeService.getSignatureCertificate(envelopeId, headers, true);
		return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
	}

	@Operation(summary = "Custody Transfer of Envelope",
			description = "This endpoint updates the owner of an envelope (custody transfer) to a new owner.")
	@PatchMapping(value = "/custody-transfer", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> transferEnvelopeCustody(
			@RequestParam @Schema(description = "ID of the envelope to transfer custody",
					example = "1") Long envelopeId,
			@RequestParam @Schema(description = "ID of the new owner in the address book",
					example = "2") Long addressbookId,
			HttpServletRequest request) {
		ResponseEntityDto response = envelopeService.transferEnvelopeCustody(envelopeId, addressbookId,
				EsignUtil.getClientIp(request));
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Void an envelope", description = "This endpoint voids an existing envelope by its ID.")
	@PatchMapping(value = "/void/{envelopeId}", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> voidEnvelope(
			@PathVariable @Schema(description = "ID of the envelope to void", example = "1") Long envelopeId,
			@Valid @RequestBody VoidEnvelopeRequestDto voidEnvelopeRequestDto, HttpServletRequest request) {
		ResponseEntityDto response = envelopeService.voidEnvelope(envelopeId, voidEnvelopeRequestDto,
				EsignUtil.getClientIp(request));
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Decline an envelope",
			description = "This endpoint allows a recipient to decline an envelope.")
	@PatchMapping(value = "/decline", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS','ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> declineEnvelope(
			@RequestParam @Schema(description = "ID of the recipient", example = "1") Long recipientId,
			@Valid @RequestBody DeclineEnvelopeRequestDto declineEnvelopeRequestDto, HttpServletRequest request) {
		ResponseEntityDto response = envelopeService.declineEnvelope(recipientId, declineEnvelopeRequestDto, true,
				EsignUtil.getClientIp(request));
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Decline Envelope Internally",
			description = "Allows an internal user to decline an envelope on behalf of a recipient. Records the reason for the decline and updates the envelope status accordingly.")
	@PatchMapping(value = "/internal/decline", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> declineEnvelopeInternal(
			@RequestParam @Schema(description = "ID of the recipient", example = "1") Long recipientId,
			@Valid @RequestBody DeclineEnvelopeRequestDto declineEnvelopeRequestDto, HttpServletRequest request) {
		ResponseEntityDto response = envelopeService.declineEnvelope(recipientId, declineEnvelopeRequestDto, false,
				EsignUtil.getClientIp(request));
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@Operation(summary = "Retrieve envelope tier limitations for the current tenant/organization",
			description = "Provides the remaining and allocated envelope limits for the organization, based on their subscription tier. "
					+ "This endpoint returns information about envelope usage, allocation, and whether the organization has reached their envelope limit for the current tier.")
	@GetMapping(value = "envelope-limitation", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ESIGN_SENDER')")
	public ResponseEntity<ResponseEntityDto> getEnvelopeTierLimitations() {
		ResponseEntityDto response = envelopeService.getEnvelopeTierLimitations();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get paginated envelopes received to current user",
			description = "Returns a paginated list of envelopes received to current user(inbox), including subject, "
					+ "sender email, status, expiry date, and received date. Supports filtering by envelope status, "
					+ "searching by subject or sender email, and sorting by expire dates.")
	@GetMapping(value = "/next", produces = MediaType.APPLICATION_JSON_VALUE)
	@PreAuthorize("hasAnyRole('ESIGN_EMPLOYEE')")
	public ResponseEntity<ResponseEntityDto> getCurrentUserNextEnvelopes(EnvelopeNextFilterDto envelopeNextFilterDto) {
		ResponseEntityDto response = envelopeService.getCurrentUserNextEnvelopes(envelopeNextFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
