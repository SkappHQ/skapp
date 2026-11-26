package com.skapp.community.leaveplanner.repository.projection;

import com.skapp.community.leaveplanner.type.LeaveState;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class LeaveRequestPeriod {

	private Long typeId;

	private LocalDate startDate;

	private LocalDate endDate;

	private LeaveState leaveState;

}
