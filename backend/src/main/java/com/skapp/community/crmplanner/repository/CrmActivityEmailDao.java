package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmActivityEmail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CrmActivityEmailDao extends JpaRepository<CrmActivityEmail, Long> {

}
