package com.skapp.enterprise.leaveplanner.payload.response;

import com.skapp.enterprise.leaveplanner.payload.EpWorkingHoursDto;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@RequiredArgsConstructor
public class EpLeaveDurationAndWorkingHoursResponseDto {

	private LocalDate startDate;

	private LocalDate endDate;

	private EpWorkingHoursDto workingHours;

	private Boolean isSingleDay;

	private Boolean isHalfDay;

}
