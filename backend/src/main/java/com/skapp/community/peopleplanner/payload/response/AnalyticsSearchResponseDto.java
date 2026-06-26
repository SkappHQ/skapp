package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.leaveplanner.payload.EmployeeSummarizedResponseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@Getter
@Setter
public class AnalyticsSearchResponseDto {

	List<EmployeeSummarizedResponseDto> employeeResponseDtoList;

	List<TeamDetailResponseDto> teamResponseDtoList;

}
