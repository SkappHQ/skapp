package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.AuditTrail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditTrailDao extends JpaRepository<AuditTrail, Long> {

    List<AuditTrail> findByEnvelopeId(Long envelopeId);
    List<AuditTrail> findByEnvelopeIdOrderByTimestampAsc(Long envelopeId);


}
