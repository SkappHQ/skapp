package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmActivityEmailContact;
import com.skapp.community.crmplanner.model.CrmActivityEmailContactId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrmActivityEmailContactDao extends JpaRepository<CrmActivityEmailContact, CrmActivityEmailContactId> {

	List<CrmActivityEmailContact> findByEmailId(Long emailId);

}
