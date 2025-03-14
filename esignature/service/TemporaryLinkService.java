package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.model.TemporaryLink;

import java.util.List;

public interface TemporaryLinkService {

	/**
	 * Creates a temporary link for a document that expires after a specified time or
	 * number of clicks.
	 * @param documentId The ID of the document to create a link for
	 * @param expirationHours Number of hours until expiration (default 48 if null)
	 * @param maxClicks Maximum number of clicks allowed (default 5 if null)
	 * @return The generated token for the temporary link
	 */
	String createTemporaryLink(Long documentId, Integer expirationHours, Integer maxClicks);

	/**
	 * Validates a temporary link token and increments its click count if valid.
	 * @param token The token to validate
	 * @return The TemporaryLink object if valid
	 * @throws if the link is invalid or expired
	 */
	TemporaryLink validateAndGetLink(String token);

	/**
	 * Deactivates a temporary link by its token.
	 * @param token The token of the link to deactivate
	 */
	void deactivateLink(String token);

	/**
	 * Gets all active temporary links for a document.
	 * @param documentId The ID of the document
	 * @return List of active TemporaryLink objects
	 */
	List<TemporaryLink> getActiveLinksForDocument(Long documentId);

	/**
	 * Deactivates all temporary links for a document.
	 * @param documentId The ID of the document
	 */
	void deactivateAllForDocument(Long documentId);

}