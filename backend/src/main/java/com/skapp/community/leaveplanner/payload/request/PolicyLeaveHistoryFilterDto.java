package com.skapp.community.leaveplanner.payload.request;

import com.skapp.community.leaveplanner.type.LeaveRequestSort;
import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class PolicyLeaveHistoryFilterDto {

	private int page = 0;

	private int size = 10;

	private List<LeaveRequestStatus> status;

	private List<Long> leaveType;

	private LocalDate startDate;

	private LocalDate endDate;

	private Boolean isExport = false;

	private Sort.Direction sortOrder = Sort.Direction.DESC;

	private LeaveRequestSort sortKey = LeaveRequestSort.START_DATE;

}
