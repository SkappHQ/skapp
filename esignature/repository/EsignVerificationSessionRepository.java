package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.EsignVerificationSession;
import org.springframework.stereotype.Repository;

@Repository
public interface EsignVerificationSessionRepository {

	EsignVerificationSession findByDocumentIdAndRecipientIdForUpdate(Long documentId, Long recipientId);

}
