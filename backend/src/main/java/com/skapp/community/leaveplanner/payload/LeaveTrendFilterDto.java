package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class LeaveTrendFilterDto {

	private LeaveTrendFilterByTime time = LeaveTrendFilterByTime.BY_DAY;

	private LeaveTrendFilterByAvailability availability = LeaveTrendFilterByAvailability.AWAY;

	private LocalDate startDate;

	private LocalDate endDate;

	public enum LeaveTrendFilterByAvailability {

		ONLINE, AWAY

	}

	public enum LeaveTrendFilterByTime {

		BY_DAY, BY_MONTH

	}

}
