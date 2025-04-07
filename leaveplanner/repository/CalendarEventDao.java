package com.skapp.enterprise.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.LeaveRequest;
import com.skapp.enterprise.leaveplanner.model.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalendarEventDao extends JpaRepository<CalendarEvent, Long> {

	List<CalendarEvent> findByLeaveRequest(LeaveRequest leaveRequest);

	void deleteByEventId(String eventId);

}
