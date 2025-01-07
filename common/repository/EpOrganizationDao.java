package com.skapp.enterprise.common.repository;

import com.skapp.enterprise.common.model.EpOrganization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EpOrganizationDao
		extends JpaRepository<EpOrganization, Long>, JpaSpecificationExecutor<EpOrganization> {

	EpOrganization findTopByOrderByOrganizationIdDesc();

}
