package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.peopleplanner.type.RequestStatus;
import com.skapp.community.peopleplanner.type.RequestType;
import com.skapp.community.timeplanner.type.TimeRequestSort;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class EmployeeTimeRequestFilterDto {

	@NotNull
	private LocalDate startDate;

	@NotNull
	private LocalDate endDate;

	private List<RequestStatus> status;

	private RequestType requestType;

	private Long employeeId;

	private LocalDate date;

	private Long recordId;

	private Long startTime;

	private Long endTime;

	private int pageNumber = 0;

	private int pageSize = 10;

	private Sort.Direction sortBy = Sort.Direction.ASC;

	private TimeRequestSort sortKey = TimeRequestSort.REQUESTED_START_TIME;

	private Boolean isExport = false;

}
