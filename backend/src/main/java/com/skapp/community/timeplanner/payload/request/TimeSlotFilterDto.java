package com.skapp.community.timeplanner.payload.request;

import com.skapp.community.timeplanner.type.SlotType;
import com.skapp.community.timeplanner.type.TimeSlotSort;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class TimeSlotFilterDto {

	private Long employeeId;

	private LocalDate date;

	private Long startTime;

	private Long endTime;

	private Long recordId;

	private List<SlotType> slotType;

	private int pageNumber = 0;

	private int pageSize = 10;

	private Sort.Direction sortBy = Sort.Direction.ASC;

	private TimeSlotSort sortKey = TimeSlotSort.START_TIME;

	private Boolean isExport = false;

}
