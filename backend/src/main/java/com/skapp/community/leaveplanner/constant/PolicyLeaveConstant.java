package com.skapp.community.leaveplanner.constant;

import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import lombok.experimental.UtilityClass;

import java.time.MonthDay;
import java.util.List;

@UtilityClass
public class PolicyLeaveConstant {

	public static final List<LeaveRequestStatus> BALANCE_HOLDING_STATUSES = List.of(LeaveRequestStatus.PENDING,
			LeaveRequestStatus.APPROVED);

	public static final MonthDay DEFAULT_CYCLE_ANCHOR = MonthDay.of(1, 1);

	public static final float SINGLE_WORKING_DAY = 1f;

	public static final int MAX_ACCRUAL_PERIODS = 100_000;

	public static final int MAX_CARRYOVER_CYCLES = 100;

	public static final int MAX_REQUEST_DESCRIPTION_LENGTH = 255;

	public static final int MAX_YEAR_OFFSET = 5;

	public static final int MAX_ATTACHMENTS = 5;

}
