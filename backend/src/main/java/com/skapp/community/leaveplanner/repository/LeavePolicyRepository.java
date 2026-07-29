package com.skapp.community.leaveplanner.repository;

import com.skapp.community.leaveplanner.model.LeavePolicy;
import com.skapp.community.leaveplanner.payload.request.LeavePolicyFilterDto;
import com.skapp.community.leaveplanner.type.LeavePolicyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.List;

public interface LeavePolicyRepository {

	Page<LeavePolicy> findLeavePolicies(LeavePolicyFilterDto filterDto, Pageable pageable);

	List<LeavePolicy> findByNamesIgnoreCaseAndStatus(Collection<String> names, LeavePolicyStatus status);

}
