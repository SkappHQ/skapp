package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmActivityTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CrmActivityTaskDao extends JpaRepository<CrmActivityTask, Long> {

	Optional<CrmActivityTask> findByIdAndIsDeletedFalse(Long id);

}
