package com.skapp.community.okrplanner.payload.request;

import com.skapp.community.okrplanner.type.OkrTimePeriod;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CompanyObjectiveRequestDto {

	private String title;

	private String description;

	private Integer year;

	private OkrTimePeriod timePeriod;

}
