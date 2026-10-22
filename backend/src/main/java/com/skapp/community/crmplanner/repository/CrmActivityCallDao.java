package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmActivityCall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CrmActivityCallDao extends JpaRepository<CrmActivityCall, Long> {

}
