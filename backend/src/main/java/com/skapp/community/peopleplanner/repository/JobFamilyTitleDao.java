package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.JobFamilyTitle;
import com.skapp.community.peopleplanner.model.JobFamilyTitleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface JobFamilyTitleDao
		extends JpaRepository<JobFamilyTitle, JobFamilyTitleId>, JpaSpecificationExecutor<JobFamilyTitle> {

}
