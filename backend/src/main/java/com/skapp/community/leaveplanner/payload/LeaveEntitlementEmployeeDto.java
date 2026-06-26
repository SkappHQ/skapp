package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.type.EmployeeSort;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;
import org.springframework.lang.Nullable;

import java.util.List;

@Getter
@Setter
public class LeaveEntitlementEmployeeDto {

	@Min(0)
	private int page = 0;

	@Min(1)
	private int size = 10;

	private Integer year;

	private List<Long> leaveTypeId;

	private List<LeaveRequestStatus> leaveRequestStatus;

	@Nullable
	private Long jobFamilyId;

	@Nullable
	private Long teamId;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private EmployeeSort sortKey = EmployeeSort.NAME;

}
