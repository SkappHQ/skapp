package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.DocumentLink;
import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentLinkRepository extends JpaRepository<DocumentLink, Long> {

	Optional<DocumentLink> findByToken(String token);

	Optional<DocumentLink> findByEnvelopeIdAndRecipientIdAndIsActiveTrue(Envelope envelope, Recipient recipient);

}
