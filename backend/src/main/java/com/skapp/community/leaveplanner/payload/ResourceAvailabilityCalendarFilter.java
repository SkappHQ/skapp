package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.Month;
import java.time.Year;
import java.util.List;

@Getter
@Setter
public class ResourceAvailabilityCalendarFilter {

	private Year year;

	private Month month;

	private List<Long> teams;

	private LocalDate startDate;

	private LocalDate endDate;

}
