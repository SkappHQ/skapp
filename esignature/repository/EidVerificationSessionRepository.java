package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.EidVerificationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EidVerificationSessionRepository extends JpaRepository<EidVerificationSession, Long> {

	/**
	 * Find session by its UUID.
	 */
	Optional<EidVerificationSession> findBySessionUuid(String sessionUuid);

	/**
	 * Find the latest session for a recipient and document.
	 */
	Optional<EidVerificationSession> findFirstByRecipientIdAndDocumentIdOrderByInitiatedAtDesc(Long recipientId,
			Long documentId);

}
