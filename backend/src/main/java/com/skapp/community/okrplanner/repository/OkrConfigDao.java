package com.skapp.community.okrplanner.repository;

import com.skapp.community.okrplanner.model.OkrConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface OkrConfigDao
		extends JpaRepository<OkrConfig, Long>, JpaSpecificationExecutor<OkrConfig>, OkrConfigRepository {

	Optional<OkrConfig> findFirstBy();

}
