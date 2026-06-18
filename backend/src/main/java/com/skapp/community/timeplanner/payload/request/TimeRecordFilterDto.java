package com.skapp.community.timeplanner.payload.request;

import com.skapp.community.timeplanner.type.TimeRecordSort;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;

@Getter
@Setter
public class TimeRecordFilterDto {

	private int page = 0;

	private int size = 7;

	private LocalDate startDate;

	private LocalDate endDate;

	private Boolean isExport = false;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private TimeRecordSort sortKey = TimeRecordSort.DATE;

}
