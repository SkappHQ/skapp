package com.skapp.community.crmplanner.repository;

import java.util.List;
import java.util.Optional;

import com.skapp.community.crmplanner.model.CrmTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CrmTaskDao extends JpaRepository<CrmTask, Long>, CrmTaskRepository {

	Optional<CrmTask> findByIdAndIsDeletedFalse(Long id);

	List<CrmTask> findByContact_IdAndIsDeletedFalse(Long contactId);

	List<CrmTask> findByDeal_Contact_IdAndIsDeletedFalse(Long contactId);

	List<CrmTask> findByDeal_IdAndIsDeletedFalse(Long dealId);

}
