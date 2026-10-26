package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmActivityType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CrmActivityFeedFilterDto {

	private CrmActivityType type;

	private String search;

	private Long ownerId;

	private LocalDate fromDate;

	private LocalDate toDate;

	@Min(0)
	private int page = 0;

	@Min(1)
	@Max(100)
	private int size = 25;

}
