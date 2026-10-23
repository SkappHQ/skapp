package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
public class CrmActivityListFilterDto {

	private String searchKeyword;

	private Long ownerId;

	@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	private LocalDate startDate;

	@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	private LocalDate endDate;

	private Sort.Direction sortOrder;

}
