package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.payload.LeavePolicyAssignedEmployeeCountDto;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyFilterDto;
import com.skapp.community.leaveplanner.type.LeavePolicyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Set;

public interface LeavePolicyRepository {

	Page<LeavePolicyAssignedEmployeeCountDto> findLeavePolicies(LeavePolicyFilterDto filterDto, Pageable pageable);

	List<LeavePolicy> findByNamesIgnoreCaseAndStatus(Set<String> names, LeavePolicyStatus status);

}
