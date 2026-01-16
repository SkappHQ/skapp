package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.TemplateEnvelope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TemplateEnvelopeDao extends JpaRepository<TemplateEnvelope, Long>, TemplateEnvelopeRepository {

	Optional<TemplateEnvelope> findByNameIgnoreCase(String name);

}
