package com.skapp.community.timeplanner.repository;

import com.skapp.community.timeplanner.model.TimeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeRequestDao extends JpaRepository<TimeRequest, Long>, TimeRequestRepository {

	List<TimeRequest> findByEmployeeEmployeeIdAndRequestedStartTimeBetween(Long employeeId, Long startTime,
			Long endTime);

}
