package com.skapp.community.okrplanner.repository;

import com.skapp.community.okrplanner.model.OkrConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface OkrConfigDao
		extends JpaRepository<OkrConfig, Long>, JpaSpecificationExecutor<OkrConfig>, OkrConfigRepository {

}
