package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmActivityCall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CrmActivityCallDao extends JpaRepository<CrmActivityCall, Long>, CrmActivityCallRepository {

	Optional<CrmActivityCall> findByIdAndIsDeletedFalse(Long id);

}
