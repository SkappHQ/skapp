package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.type.EmployeeAvailabilityStatus;
import com.skapp.community.peopleplanner.payload.response.HolidayResponseDto;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class OrganizationResourceAvailabilityResponseDto {

	private LocalDate date;

	private EmployeeAvailabilityStatus availabilityStatus;

	private Integer availableEmployeeCount;

	private List<EmployeeLeaveRequestListResponseDto> employeesOnLeaveRequestResponseDtos;

	private List<HolidayResponseDto> holidayResponseDto;

}
