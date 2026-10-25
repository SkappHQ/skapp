package com.skapp.community.crmplanner.payload.request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
public class CrmActivityFeedFilterDto {

	private String type;

	private String search;

	private Long ownerId;

	@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	private LocalDate from;

	@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
	private LocalDate to;

	private int page = 0;

}
