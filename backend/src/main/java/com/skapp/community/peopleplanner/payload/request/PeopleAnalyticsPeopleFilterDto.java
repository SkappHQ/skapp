package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PeopleAnalyticsPeopleFilterDto {

	private Long teamId;

	private String employeeName;

	private Boolean isActive;

}
