package com.skapp.enterprise.common.repository;

import com.skapp.community.common.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EpDataResetDao extends JpaRepository<Organization, Long>, EpDataResetRepository {

}
