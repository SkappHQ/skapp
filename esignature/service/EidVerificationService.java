package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.eid.InitiateVerificationRequestDto;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Service interface for eID verification operations.
 */
public interface EidVerificationService {

	/**
	 * Get all available (enabled) eID providers.
	 * @return ResponseEntityDto containing list of AvailableProviderResponseDto
	 */
	ResponseEntityDto getAvailableProviders();

	/**
	 * Initiate a verification session.
	 * @param request The initiation request
	 * @param httpRequest The HTTP servlet request (used to extract client IP)
	 * @return ResponseEntityDto containing VerificationInitiationResponseDto
	 */
	ResponseEntityDto initiateVerification(InitiateVerificationRequestDto request, HttpServletRequest httpRequest);

	/**
	 * Check the status of a verification session.
	 * @param sessionId The session UUID
	 * @return ResponseEntityDto containing VerificationStatusResponseDto
	 */
	ResponseEntityDto checkVerificationStatus(String sessionId);

	/**
	 * Cancel a verification session.
	 * @param sessionId The session UUID
	 * @return ResponseEntityDto with success/failure message
	 */
	ResponseEntityDto cancelVerification(String sessionId);

	/**
	 * Get the active verification session for a recipient and document, if one exists.
	 * This allows the frontend to recover from lost session IDs by retrieving any
	 * existing active session.
	 * @param recipientId The recipient ID
	 * @param documentId The document ID
	 * @return ResponseEntityDto containing VerificationStatusResponseDto if active
	 * session exists, or null data if no active session
	 */
	ResponseEntityDto getActiveSession(Long recipientId, Long documentId);

}
