package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.peopleplanner.payload.sortkey.EmployeeSort;
import com.skapp.community.peopleplanner.payload.sortkey.LogFilterDailySort;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;

@Getter
@Setter
public class ManagerEmployeeLogFilterDto {

	@Min(0)
	private int page = 0;

	@Min(1)
	private int size = 10;

	@NotNull
	private Long employeeId;

	@NotNull
	private LocalDate startDate;

	@NotNull
	private LocalDate endDate;

	private Boolean isExport = false;

	private Sort.Direction sortOrder = Sort.Direction.DESC;

	private LogFilterDailySort sortKey = LogFilterDailySort.DATE;

	private EmployeeSort empSortKey = EmployeeSort.NAME;

}
