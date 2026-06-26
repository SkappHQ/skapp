package com.skapp.community.peopleplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
public class JobFamilyOverviewDto {

	Long jobFamilyId;

	String jobFamilyName;

	Long employeeCount;

	List<JobTitleOverviewDto> jobTitleOverview;

	public JobFamilyOverviewDto(Long jobFamilyId, String jobFamilyName, Long employeeCount) {
		this.jobFamilyId = jobFamilyId;
		this.jobFamilyName = jobFamilyName;
		this.employeeCount = employeeCount;
		this.jobTitleOverview = new ArrayList<>();
	}

}
