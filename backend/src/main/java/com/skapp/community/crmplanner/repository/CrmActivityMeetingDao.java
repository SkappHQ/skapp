package com.skapp.community.crmplanner.repository;

import com.skapp.community.crmplanner.model.CrmActivityMeeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CrmActivityMeetingDao extends JpaRepository<CrmActivityMeeting, Long> {

}
