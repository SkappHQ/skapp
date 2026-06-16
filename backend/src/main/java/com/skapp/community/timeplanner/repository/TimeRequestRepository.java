package com.skapp.community.timeplanner.repository;

import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.payload.request.EmployeeTimeRequestFilterDto;
import com.skapp.community.timeplanner.model.TimeRequest;
import com.skapp.community.timeplanner.payload.request.ManagerTimeRequestFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TimeRequestRepository {

	Page<TimeRequest> findAllTimeRequestsOnDateByFilters(Employee currentEmployee,
			EmployeeTimeRequestFilterDto employeeTimeRequestFilterDto, Pageable pageable);

	List<TimeRequest> findTimeRequestsByOptionalFilters(EmployeeTimeRequestFilterDto employeeTimeRequestFilterDto);

	List<TimeRequest> findPendingEntryRequestsWithoutTimeRecordId(Long employeeId, Long startTime, Long endTime);

	Page<TimeRequest> findAllAssignEmployeesTimeRequests(Long userId, ManagerTimeRequestFilterDto timeRequestFilterDto,
			Pageable pageable);

	Long countSupervisedPendingTimeRequests(Long userId);

}
