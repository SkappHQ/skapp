package com.skapp.community.common.repository;

import com.skapp.community.common.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationDao extends JpaRepository<Organization, Long>, OrganizationRepository {

	Optional<Organization> findTopByOrderByOrganizationIdDesc();

}
