package com.skapp.community.timeplanner.payload.request;

import com.skapp.community.peopleplanner.type.RequestStatus;
import com.skapp.community.peopleplanner.type.RequestType;
import com.skapp.community.timeplanner.type.TimeRequestSort;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ManagerTimeRequestFilterDto {

	private RequestType requestType;

	private List<RequestStatus> status;

	private LocalDate startDate;

	private LocalDate endDate;

	private int pageNumber = 0;

	private int pageSize = 10;

	private Sort.Direction sortBy = Sort.Direction.ASC;

	private TimeRequestSort sortKey = TimeRequestSort.REQUESTED_START_TIME;

	private Boolean isExport = false;

}
