package com.skapp.community.leaveplanner.payload.request;

import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import com.skapp.community.leaveplanner.type.PolicyLeaveRequestSort;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.util.List;

@Getter
@Setter
public class PolicyLeaveRequestFilterDto {

	@Min(0)
	private int page = 0;

	@Min(1)
	private int size = 10;

	private PolicyLeaveRequestSort sortKey = PolicyLeaveRequestSort.CREATED_DATE;

	private Sort.Direction sortOrder = Sort.Direction.DESC;

	private Integer year;

	private List<LeaveRequestStatus> status;

	private List<Long> policyId;

}
