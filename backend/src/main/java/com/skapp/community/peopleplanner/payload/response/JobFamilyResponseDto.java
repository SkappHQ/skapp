package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.peopleplanner.payload.request.JobTitleDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class JobFamilyResponseDto {

	private Long jobFamilyId;

	private String name;

	private List<JobTitleDto> jobTitles;

}
