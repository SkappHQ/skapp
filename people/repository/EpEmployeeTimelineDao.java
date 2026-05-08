package com.skapp.enterprise.people.repository;

import com.skapp.enterprise.people.model.EmployeeTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface EpEmployeeTimelineDao extends JpaRepository<EmployeeTimeline, Long>,
		JpaSpecificationExecutor<EmployeeTimeline>, EpEmployeeTimelineRepository {

}
