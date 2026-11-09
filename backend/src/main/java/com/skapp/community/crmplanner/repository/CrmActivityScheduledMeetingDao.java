package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmActivityScheduledMeeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CrmActivityScheduledMeetingDao extends JpaRepository<CrmActivityScheduledMeeting, Long> {

}
