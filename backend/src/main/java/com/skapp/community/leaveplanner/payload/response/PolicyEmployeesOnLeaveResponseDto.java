package com.skapp.community.leaveplanner.payload.response;

import com.skapp.community.peopleplanner.payload.response.HolidayResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class PolicyEmployeesOnLeaveResponseDto {

	private LocalDate date;

	private Boolean isNonWorkingDay;

	private List<HolidayResponseDto> holidays;

	private Long onLeaveCount;

	private Long onlineCount;

}
