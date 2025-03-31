package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.AuditTrail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditTrailDao extends JpaRepository<AuditTrail, Long> {

}
