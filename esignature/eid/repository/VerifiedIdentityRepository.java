package com.skapp.enterprise.esignature.eid.repository;

import com.skapp.enterprise.esignature.eid.model.VerifiedIdentity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerifiedIdentityRepository extends JpaRepository<VerifiedIdentity, Long> {

	/**
	 * Find verified identity for a recipient and document combination.
	 */
	Optional<VerifiedIdentity> findByRecipientIdAndDocumentId(Long recipientId, Long documentId);

	/**
	 * Find verified identity by session ID.
	 */
	Optional<VerifiedIdentity> findBySessionId(Long sessionId);

	/**
	 * Check if a verified identity exists for recipient and document.
	 */
	boolean existsByRecipientIdAndDocumentId(Long recipientId, Long documentId);

	/**
	 * Find verified identity by personal number hash (for lookups without decryption).
	 */
	Optional<VerifiedIdentity> findByPersonalNumberHash(String personalNumberHash);

}
