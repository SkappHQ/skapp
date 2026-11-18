package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;

@Getter
@Setter
public class CrmActivityListFilterDto {

	private String searchKeyword;

	private Long ownerId;

	private LocalDate startDate;

	private LocalDate endDate;

	private Sort.Direction sortOrder;

}
