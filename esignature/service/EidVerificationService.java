package com.skapp.enterprise.esignature.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.payload.request.eid.InitiateVerificationRequestDto;

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
	 * @param endUserIp IP address of the end user
	 * @return ResponseEntityDto containing VerificationInitiationResponseDto
	 */
	ResponseEntityDto initiateVerification(InitiateVerificationRequestDto request, String endUserIp);

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

}
