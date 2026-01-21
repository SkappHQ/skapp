package com.skapp.enterprise.esignature.eid.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.config.RequestMethodContext;
import com.skapp.enterprise.esignature.eid.payload.request.InitiateVerificationRequestDto;
import com.skapp.enterprise.esignature.eid.service.EidVerificationService;
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
					+ "Returns tokens needed to launch the eID app (autoStartToken for same-device, "
					+ "qrStartToken for cross-device).")
	@PreAuthorize("hasAnyRole('ROLE_DOC_ACCESS', 'ROLE_ESIGN_EMPLOYEE')")
	@PostMapping(value = "/initiate", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<ResponseEntityDto> initiateVerification(
			@Valid @RequestBody InitiateVerificationRequestDto request, HttpServletRequest httpRequest) {

		String endUserIp = getClientIpAddress(httpRequest);
		ResponseEntityDto response = eidVerificationService.initiateVerification(request, endUserIp);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@Operation(summary = "Check verification status",
			description = "Polls the current status of a verification session. "
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

	/**
	 * Extract client IP address from request, handling proxies.
	 */
	private String getClientIpAddress(HttpServletRequest request) {
		String xForwardedFor = request.getHeader("X-Forwarded-For");
		if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
			// X-Forwarded-For may contain multiple IPs; take the first (client IP)
			return xForwardedFor.split(",")[0].trim();
		}

		String xRealIp = request.getHeader("X-Real-IP");
		if (xRealIp != null && !xRealIp.isEmpty()) {
			return xRealIp;
		}

		return request.getRemoteAddr();
	}

}
