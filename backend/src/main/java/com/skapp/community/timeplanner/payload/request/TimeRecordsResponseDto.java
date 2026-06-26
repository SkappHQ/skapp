package com.skapp.community.timeplanner.payload.request;

import com.skapp.community.peopleplanner.payload.response.EmployeeTeamResponseDto;
import com.skapp.community.timeplanner.payload.response.TimeRecordChipResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TimeRecordsResponseDto {

	private EmployeeTeamResponseDto employee;

	private List<TimeRecordChipResponseDto> timeRecords;

}
