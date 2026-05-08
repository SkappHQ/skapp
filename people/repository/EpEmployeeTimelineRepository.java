package com.skapp.enterprise.people.repository;

import com.skapp.enterprise.people.model.EmployeeTimeline;

import java.util.List;

public interface EpEmployeeTimelineRepository {

	List<EmployeeTimeline> findAllByEmployeeIdWithRecordedBy(Long employeeId);

}
