package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.EsignVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EsignVerificationDao extends JpaRepository<EsignVerification, Long> {

	Optional<EsignVerification> findByDocument_IdAndRecipient_Id(Long documentId, Long recipientId);

}
