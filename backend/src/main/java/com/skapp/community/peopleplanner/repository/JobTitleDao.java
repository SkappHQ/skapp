package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.JobTitle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobTitleDao
		extends JpaRepository<JobTitle, Long>, JpaSpecificationExecutor<JobTitle>, JobFamilyRepository {

	Optional<JobTitle> findByJobTitleIdAndIsActive(Long jobTitleId, Boolean isActive);

	boolean existsByJobTitleIdAndIsActive(Long jobTitleId, boolean isActive);

}
