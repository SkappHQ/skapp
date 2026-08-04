package com.skapp.community.leaveplanner.constant;

import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import lombok.experimental.UtilityClass;

import java.util.List;

@UtilityClass
public class PolicyLeaveConstant {

	/**
	 * Statuses that hold balance against a policy. A request in any other status has
	 * already released the days it reserved.
	 */
	public static final List<LeaveRequestStatus> BALANCE_HOLDING_STATUSES = List.of(LeaveRequestStatus.PENDING,
			LeaveRequestStatus.APPROVED);

	/** Upper bound on accrual period iteration, guards against runaway loops. */
	public static final int MAX_ACCRUAL_PERIODS = 100_000;

	/** Upper bound on cycle back-walk when resolving carried-over opening balances. */
	public static final int MAX_CARRYOVER_CYCLES = 100;

	public static final int MAX_REQUEST_DESCRIPTION_LENGTH = 255;

	/** How far either side of the current year a balance may be requested. */
	public static final int MAX_YEAR_OFFSET = 5;

	public static final int MAX_ATTACHMENTS = 5;

}
