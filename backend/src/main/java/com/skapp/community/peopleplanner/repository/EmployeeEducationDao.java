package com.skapp.community.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.EmployeeEducation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeEducationDao
		extends JpaRepository<EmployeeEducation, Long>, JpaSpecificationExecutor<EmployeeEducation> {

	void deleteAllByEducationIdIn(List<Long> educationIds);

}
