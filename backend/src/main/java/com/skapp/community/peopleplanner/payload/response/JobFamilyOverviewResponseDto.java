package com.skapp.community.peopleplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class JobFamilyOverviewResponseDto {

	List<JobFamilyOverviewDto> jobFamilyOverviewDtos;

}
