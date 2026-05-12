package com.skapp.community.common.repository;

import com.skapp.community.common.model.WorkLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkLocationDao extends JpaRepository<WorkLocation, Long>, WorkLocationRepository {

	boolean existsByNameIgnoreCase(String name);

	boolean existsByNameIgnoreCaseAndWorkLocationIdNot(String name, Long workLocationId);

}
