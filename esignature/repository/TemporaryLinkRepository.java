package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.Envelope;
import com.skapp.enterprise.esignature.model.Recipient;
import com.skapp.enterprise.esignature.model.TemporarySignLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TemporaryLinkRepository extends JpaRepository<TemporarySignLink, Long> {

	Optional<TemporarySignLink> findByToken(String token);

	Optional<TemporarySignLink> findByEnvelopeIdAndRecipientId(Envelope envelope, Recipient recipient);

}
