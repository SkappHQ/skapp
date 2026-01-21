package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.EidVerificationSession;
import com.skapp.enterprise.esignature.type.EidVerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EidVerificationSessionRepository extends JpaRepository<EidVerificationSession, Long> {

	/**
	 * Find session by its UUID.
	 */
	Optional<EidVerificationSession> findBySessionUuid(String sessionUuid);

	/**
	 * Find session by provider-specific session ID (e.g., BankID orderRef).
	 */
	Optional<EidVerificationSession> findByProviderSessionId(String providerSessionId);

	/**
	 * Find all sessions for a recipient and document.
	 */
	List<EidVerificationSession> findByRecipientIdAndDocumentId(Long recipientId, Long documentId);

	/**
	 * Find the latest session for a recipient and document.
	 */
	Optional<EidVerificationSession> findFirstByRecipientIdAndDocumentIdOrderByInitiatedAtDesc(Long recipientId,
			Long documentId);

	/**
	 * Find sessions by status (e.g., for cleanup of expired sessions).
	 */
	List<EidVerificationSession> findByStatus(EidVerificationStatus status);

	/**
	 * Check if a verified session exists for recipient and document.
	 */
	boolean existsByRecipientIdAndDocumentIdAndStatus(Long recipientId, Long documentId, EidVerificationStatus status);

}
