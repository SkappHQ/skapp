package com.skapp.enterprise.common.repository;

import com.skapp.community.common.model.OrganizationConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface EpOrganizationConfigDao
		extends JpaRepository<OrganizationConfig, Long>, JpaSpecificationExecutor<OrganizationConfig> {

	Optional<OrganizationConfig> findOrganizationConfigByOrganizationConfigType(String epOrganizationConfigType);

}
