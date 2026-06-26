package com.skapp.community.common.repository;

import com.skapp.community.common.model.WorkLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkLocationDao extends JpaRepository<WorkLocation, Long>, WorkLocationRepository {

	boolean existsByNameIgnoreCase(String name);

	Optional<WorkLocation> findByNameIgnoreCase(String name);

}
