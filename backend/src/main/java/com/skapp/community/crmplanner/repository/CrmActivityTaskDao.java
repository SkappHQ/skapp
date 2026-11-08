package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmActivityTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CrmActivityTaskDao extends JpaRepository<CrmActivityTask, Long>, CrmActivityTaskRepository {

}
