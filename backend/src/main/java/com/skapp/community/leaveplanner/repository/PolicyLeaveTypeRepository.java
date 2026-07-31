package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.PolicyLeaveType;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveTypeFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PolicyLeaveTypeRepository {

	Page<PolicyLeaveType> findPolicyLeaveTypes(PolicyLeaveTypeFilterDto filterDto, Pageable pageable);

}
