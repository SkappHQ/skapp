package com.skapp.enterprise.esignature.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.config.RequestMethodContext;
import com.skapp.enterprise.esignature.payload.request.eid.InitiateVerificationRequestDto;
import com.skapp.enterprise.esignature.service.EidVerificationService;
import com.skapp.enterprise.esignature.util.EsignUtil;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS', 'ROLE_ESIGN_EMPLOYEE', 'ROLE_SUPER_ADMIN', 'ROLE_ESIGN_ADMIN')")
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

		String endUserIp = EsignUtil.getClientIp(httpRequest);
		ResponseEntityDto response = eidVerificationService.initiateVerification(request, endUserIp);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Check verification status",
			description = "Polls the current status of a verification session. "
					+ "Returns updated qrCode for cross-device flow (refreshed each call). "
					+ "Frontend should call this every 2 seconds until status is terminal "
					+ "(VERIFIED, FAILED, EXPIRED, CANCELLED).")
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS', 'ROLE_ESIGN_EMPLOYEE')")
	@GetMapping(value = "/status/{sessionId}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> checkVerificationStatus(@PathVariable String sessionId) {
		RequestMethodContext.setReadOnly(false);
		ResponseEntityDto response = eidVerificationService.checkVerificationStatus(sessionId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Cancel verification",
			description = "Cancels an ongoing verification session. "
					+ "This should be called when the user closes the verification modal.")
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS', 'ROLE_ESIGN_EMPLOYEE')")
	@PostMapping(value = "/cancel/{sessionId}", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> cancelVerification(@PathVariable String sessionId) {

		ResponseEntityDto response = eidVerificationService.cancelVerification(sessionId);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
