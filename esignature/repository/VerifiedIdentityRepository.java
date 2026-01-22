package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.VerifiedIdentity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VerifiedIdentityRepository extends JpaRepository<VerifiedIdentity, Long> {

	/**
	 * Check if a verified identity exists for recipient and document.
	 */
	boolean existsByRecipientIdAndDocumentId(Long recipientId, Long documentId);

}
