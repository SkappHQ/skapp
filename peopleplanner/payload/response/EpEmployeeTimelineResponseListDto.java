package com.skapp.enterprise.peopleplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EpEmployeeTimelineResponseListDto {

	private Long year;

	private String month;

	List<EpEmployeeTimelineResponseDto> employeeTimelineRecords;

}
