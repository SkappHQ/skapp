package com.skapp.community.leaveplanner.payload.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class PolicyTeamLeaveTrendFilterDto {

	@NotNull
	private Long teamId;

	private List<Long> leaveTypeIds;

	private LocalDate startDate;

	private LocalDate endDate;

	@AssertTrue
	public boolean isDateRangeValid() {
		if (startDate == null || endDate == null) {
			return startDate == null && endDate == null;
		}
		return !startDate.isAfter(endDate);
	}

}
