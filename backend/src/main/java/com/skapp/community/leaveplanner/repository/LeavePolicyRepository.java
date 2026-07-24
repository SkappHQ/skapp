package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyFilterDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LeavePolicyRepository {

	Page<LeavePolicy> findLeavePolicies(LeavePolicyFilterDto filterDto, Pageable pageable);

}
