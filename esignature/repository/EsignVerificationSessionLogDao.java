package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.EsignVerificationSessionLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EsignVerificationSessionLogDao extends JpaRepository<EsignVerificationSessionLog, Long> {

}
