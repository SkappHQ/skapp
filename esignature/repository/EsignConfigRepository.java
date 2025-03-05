package com.skapp.enterprise.esignature.repository;

import com.skapp.enterprise.esignature.model.EsignConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EsignConfigRepository extends JpaRepository<EsignConfig, Long> {

	Optional<EsignConfig> findFirstBy();

}
