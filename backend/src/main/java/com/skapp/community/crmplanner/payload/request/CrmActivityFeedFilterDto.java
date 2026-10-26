package com.skapp.community.crmplanner.payload.request;

import com.skapp.community.crmplanner.type.CrmActivityType;
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

}
