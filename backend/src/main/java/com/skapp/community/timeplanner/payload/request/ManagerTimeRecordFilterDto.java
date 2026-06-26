package com.skapp.community.timeplanner.payload.request;

import com.skapp.community.timeplanner.type.TimeRecordSort;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.List;

@Setter
@Getter
public class ManagerTimeRecordFilterDto {

	private int page = 0;

	private int size = 7;

	private LocalDate startDate;

	private LocalDate endDate;

	private List<Long> teamIds;

	private Boolean isExport = false;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private TimeRecordSort sortKey = TimeRecordSort.NAME;

}
