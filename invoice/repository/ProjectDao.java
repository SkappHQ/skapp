package com.skapp.enterprise.invoice.repository;

import com.skapp.enterprise.invoice.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectDao extends JpaRepository<Project, Long> {

	Optional<Project> findByProjectId(Long projectId);

	List<Project> findByProjectIdIn(List<Long> projectIds);

}
