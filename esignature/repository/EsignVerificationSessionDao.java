package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.EsignVerificationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EsignVerificationSessionDao extends JpaRepository<EsignVerificationSession, Long> {

	Optional<EsignVerificationSession> findByDocument_IdAndRecipient_Id(Long documentId, Long recipientId);

}
