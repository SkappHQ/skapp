package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.eid.InitiateIdentificationRequestDto;
import com.skapp.enterprise.esignature.payload.request.eid.InitiateVerificationRequestDto;
import com.skapp.enterprise.esignature.payload.request.eid.VerificationSessionRequestDto;
import com.skapp.enterprise.esignature.service.EidVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
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

/**
 * REST controller for eID verification operations.
 *
 * Endpoints are accessible by document signers (ROLE_DOC_ACCESS) and internal users.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("v1/ep/esign/eid/verification")
@Tag(name = "eID Verification", description = "Endpoints for electronic ID verification (e.g., BankID)")
public class EidVerificationController {

	private final EidVerificationService eidVerificationService;

	@Operation(summary = "Get available eID providers",
			description = "Returns a list of enabled eID verification providers with their configuration.")
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS', 'ROLE_ESIGN_EMPLOYEE', 'ROLE_SUPER_ADMIN')")
	@GetMapping(value = "/providers", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getAvailableProviders() {
		ResponseEntityDto response = eidVerificationService.getAvailableProviders();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Initiate eID verification",
			description = "Starts a new verification session with the specified provider. "
					+ "Returns autoStartToken for same-device launch and pre-computed qrCode for cross-device. "
					+ "The qrCode is refreshed on each status poll.")
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS', 'ROLE_ESIGN_EMPLOYEE')")
	@PostMapping(value = "/initiate", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> initiateVerification(
			@Valid @RequestBody InitiateVerificationRequestDto request, HttpServletRequest httpRequest) {
		ResponseEntityDto response = eidVerificationService.initiateVerification(request, httpRequest);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Initiate eID identification",
			description = "Starts a new identification-only session with the specified provider. "
					+ "Unlike /initiate, no document is required — this flow verifies the user's identity only. "
					+ "Returns autoStartToken for same-device launch and pre-computed qrCode for cross-device. "
					+ "The qrCode is refreshed on each status poll.")
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS', 'ROLE_ESIGN_EMPLOYEE')")
	@PostMapping(value = "/identify", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> initiateIdentification(
			@Valid @RequestBody InitiateIdentificationRequestDto request, HttpServletRequest httpRequest) {
		ResponseEntityDto response = eidVerificationService.initiateIdentification(request, httpRequest);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Poll verification status",
			description = "Polls the current status of a verification session and updates the session state. "
					+ "Returns updated qrCode for cross-device flow (refreshed each call). "
					+ "Frontend should call this every 2 seconds until status is terminal "
					+ "(VERIFIED, FAILED, EXPIRED, CANCELLED). "
					+ "Uses POST because polling updates session state from the external provider.")
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS', 'ROLE_ESIGN_EMPLOYEE')")
	@PostMapping(value = "/status", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> checkVerificationStatus(
			@Valid @RequestBody VerificationSessionRequestDto request) {
		ResponseEntityDto response = eidVerificationService.checkVerificationStatus(request.getSessionId());
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Cancel verification",
			description = "Cancels an ongoing verification session. "
					+ "This should be called when the user closes the verification modal.")
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS', 'ROLE_ESIGN_EMPLOYEE')")
	@PostMapping(value = "/cancel", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> cancelVerification(
			@Valid @RequestBody VerificationSessionRequestDto request) {
		ResponseEntityDto response = eidVerificationService.cancelVerification(request.getSessionId());
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Renew verification session",
			description = "Cancels the current BankID order and creates a new one, preserving the overall 5-minute deadline. "
					+ "Call this when the current 30-second order is about to expire but the user still needs time to scan the QR code. "
					+ "Returns a fresh qrCode, sessionId and expiresAt for the new order.")
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS', 'ROLE_ESIGN_EMPLOYEE')")
	@PostMapping(value = "/renew", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> renewSession(@Valid @RequestBody VerificationSessionRequestDto request,
			HttpServletRequest httpRequest) {
		ResponseEntityDto response = eidVerificationService.renewSession(request.getSessionId(), httpRequest);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Get active verification session",
			description = "Retrieves any active verification session for the specified recipient and document. "
					+ "This allows the frontend to recover from lost session IDs (e.g., after page refresh). "
					+ "Returns the session details if an active session exists, or null if no active session.")
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS', 'ROLE_ESIGN_EMPLOYEE')")
	@GetMapping(value = "/session/active", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> getActiveSession(@RequestParam Long recipientId,
			@RequestParam Long documentId) {
		ResponseEntityDto response = eidVerificationService.getActiveSession(recipientId, documentId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
