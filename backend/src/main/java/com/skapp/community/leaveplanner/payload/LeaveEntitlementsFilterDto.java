package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.Setter;
import org.springframework.lang.Nullable;

import java.time.LocalDate;

@Getter
@Setter
public class LeaveEntitlementsFilterDto {

	@Nullable
	private LocalDate startDate;

	@Nullable
	private LocalDate endDate;

	@Nullable
	private Long leaveTypeId;

	@Nullable
	private Integer year;

	@Nullable
	private Boolean isFollowingYear;

	@Nullable
	private Boolean isManual;

}
