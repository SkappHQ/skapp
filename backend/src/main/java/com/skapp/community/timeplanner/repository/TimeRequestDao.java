package com.skapp.community.timeplanner.repository;

import com.skapp.community.peopleplanner.type.RequestStatus;
import com.skapp.community.timeplanner.model.TimeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeRequestDao extends JpaRepository<TimeRequest, Long>, TimeRequestRepository {

	List<TimeRequest> findByEmployeeEmployeeIdAndStatusAndRequestedStartTimeBetween(Long employeeId,
			RequestStatus status, Long startTime, Long endTime);

}
