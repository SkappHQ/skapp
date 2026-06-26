package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ManagerTeamResourceAvailabilityDto {

	private LocalDate startDate;

	private LocalDate endDate;

	private List<Long> teamIds;

}
