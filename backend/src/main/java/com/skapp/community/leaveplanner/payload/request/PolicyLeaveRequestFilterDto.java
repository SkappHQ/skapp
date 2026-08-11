package com.skapp.community.leaveplanner.payload.request;

import com.skapp.community.leaveplanner.type.LeaveRequestSort;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.util.List;

@Getter
@Setter
public class PolicyLeaveRequestFilterDto {

	private int page = 0;

	private int size = 10;

	private LeaveRequestSort sortKey = LeaveRequestSort.CREATED_DATE;

	private Sort.Direction sortOrder = Sort.Direction.DESC;

	private Integer year;

	private List<LeaveRequestStatus> status;

	private List<Long> policyId;

}
