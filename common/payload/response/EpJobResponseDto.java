package com.skapp.enterprise.common.payload.response;

import com.skapp.community.peopleplanner.payload.request.JobTitleDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EpJobResponseDto {

	private Long jobFamilyId;

	private String name;

	private List<JobTitleDto> jobTitles;

}
