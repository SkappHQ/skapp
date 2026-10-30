package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmActivityMeetingContact;
import com.skapp.community.crmplanner.model.CrmActivityMeetingContactId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CrmActivityMeetingContactDao
		extends JpaRepository<CrmActivityMeetingContact, CrmActivityMeetingContactId> {

}
