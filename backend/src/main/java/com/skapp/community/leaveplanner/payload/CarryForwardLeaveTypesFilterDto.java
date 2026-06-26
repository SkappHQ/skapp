package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.type.LeaveTypeSort;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.util.List;

@Getter
@Setter
public class CarryForwardLeaveTypesFilterDto {

	@Min(0)
	private int page = 0;

	@Min(1)
	private int size = 10;

	private int year = 0;

	private LeaveTypeSort sortKey = LeaveTypeSort.NAME;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private List<Long> leaveTypes;

}
