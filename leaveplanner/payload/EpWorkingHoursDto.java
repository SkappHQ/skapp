package com.skapp.enterprise.leaveplanner.payload;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
public class EpWorkingHoursDto {

	private LocalTime startTime;

	private LocalTime endTime;

}
