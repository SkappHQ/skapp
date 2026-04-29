package com.skapp.enterprise.people.repository;

import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.enterprise.people.model.EmployeeTimeline;
import com.skapp.enterprise.people.type.EpEmployeeTimelineType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EpEmployeeTimelineDao extends JpaRepository<EmployeeTimeline, Long>,
		JpaSpecificationExecutor<EmployeeTimeline>, EpEmployeeTimelineRepository {

	List<EmployeeTimeline> findAllByEmployee(Employee employee);

	List<EmployeeTimeline> findByEmployeeAndTimelineType(Employee employee, EpEmployeeTimelineType timelineType);

}
