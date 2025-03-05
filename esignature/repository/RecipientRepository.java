package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.Recipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecipientRepository extends JpaRepository<Recipient, Long> {

	Optional<List<Recipient>> findByEnvelopeId(Long envelopId);

	Optional<Recipient> findByIdAndEnvelopeId(Long id, Long envelopeId);

}
