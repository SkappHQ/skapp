package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CrmActivityFeedFilterDto {

	private String type;

	private String search;

	private Long ownerId;

	private LocalDate from;

	private LocalDate to;

	private int page = 0;

}
