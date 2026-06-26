package com.skapp.community.peopleplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JobTitleOverviewDto {

	Long jobTitleId;

	String jobTitleName;

	Long employeeCount;

	public JobTitleOverviewDto(Long jobTitleId, String jobTitleName, Long employeeCount) {
		this.jobTitleId = jobTitleId;
		this.jobTitleName = jobTitleName;
		this.employeeCount = employeeCount;
	}

}
