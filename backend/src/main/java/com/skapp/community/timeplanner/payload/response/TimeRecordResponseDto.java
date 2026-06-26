package com.skapp.community.timeplanner.payload.response;

import com.skapp.community.peopleplanner.payload.response.EmployeeTeamResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class TimeRecordResponseDto {

	private EmployeeTeamResponseDto employee;

	private List<TimeRecordChipResponseDto> timeRecords;

}
