package com.skapp.community.leaveplanner.payload;

import com.skapp.community.peopleplanner.payload.response.HolidayResponseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class AdminEmployeesOnLeaveDto {

	private AdminOnLeaveDto adminOnLeaveDto;

	private Boolean isNonWorkingDay;

	private List<HolidayResponseDto> holidayResponseDtos;

}
