package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectDao extends JpaRepository<Project, Long> {

	Optional<Project> findById_ProjectId(Long projectId);

	List<Project> findById_ProjectIdIn(List<Long> projectIds);

	List<Project> findById_Customer_Id(Long customerId);

	Optional<Project> findById_ProjectIdAndId_Customer_Id(Long projectId, Long customerId);

}
