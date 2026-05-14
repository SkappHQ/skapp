package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.peopleplanner.type.HolidayDuration;
import com.skapp.community.peopleplanner.type.HolidaySort;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class HolidayFilterDto {

	@Min(0)
	private int page = 0;

	@Min(1)
	private int size = 10;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private HolidaySort sortKey = HolidaySort.DATE;

	private List<String> colors;

	private List<HolidayDuration> holidayDurations;

	private Boolean isExport = false;

	private LocalDate date;

	private Integer year;

	private Long workLocationId;

}
