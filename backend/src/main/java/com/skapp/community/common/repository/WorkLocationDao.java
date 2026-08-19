package com.skapp.community.common.repository;

import com.skapp.community.common.model.WorkLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkLocationDao extends JpaRepository<WorkLocation, Long>, WorkLocationRepository {

	boolean existsByNameIgnoreCaseAndIsDeletedFalse(String name);

	Optional<WorkLocation> findByNameIgnoreCaseAndIsDeletedFalse(String name);

	Optional<WorkLocation> findByWorkLocationIdAndIsDeletedFalse(Long workLocationId);

	boolean existsByWorkLocationIdAndIsDeletedFalse(Long workLocationId);

	List<WorkLocation> findByIsDeletedFalse();

}
