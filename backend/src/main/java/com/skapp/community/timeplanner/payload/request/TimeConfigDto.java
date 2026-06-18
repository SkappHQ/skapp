package com.skapp.community.timeplanner.payload.request;

import com.skapp.community.timeplanner.type.TimeBlocks;
import lombok.Getter;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Set;

@Getter
@Setter
public class TimeConfigDto {

	private Set<DayCapacity> dayCapacities;

	public record TimeBlock(TimeBlocks timeBlock, Float hours) {
	}

	public record DayCapacity(DayOfWeek day, Set<TimeBlock> timeBlocks, Float totalHours, boolean isWeekStartDay,
			LocalTime time) {
	}

}