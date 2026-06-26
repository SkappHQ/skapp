package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.JobFamily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobFamilyDao
		extends JpaRepository<JobFamily, Long>, JpaSpecificationExecutor<JobFamily>, JobFamilyRepository {

	Optional<JobFamily> findByJobFamilyIdAndIsActive(Long jobFamilyId, boolean isActive);

	boolean existsByJobFamilyIdAndIsActive(Long jobFamilyId, boolean b);

}
