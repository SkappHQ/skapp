package com.skapp.enterprise.peopleplanner.repository;

import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.enterprise.peopleplanner.model.EmployeeTimeline;
import com.skapp.enterprise.peopleplanner.type.EpEmployeeTimelineType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EpEmployeeTimelineDao
		extends JpaRepository<EmployeeTimeline, Long>, JpaSpecificationExecutor<EmployeeTimeline> {

	List<EmployeeTimeline> findAllByEmployee(Employee employee);

	List<EmployeeTimeline> findByEmployeeAndTimelineType(Employee employee, EpEmployeeTimelineType timelineType);

}
