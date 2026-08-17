package com.skapp.community.leaveplanner.constant;

import lombok.experimental.UtilityClass;

@UtilityClass
public class LeavePolicyConstant {

	public static final int MAX_NAME_LENGTH = 100;

	public static final float MIN_DAYS = 0.5F;

	public static final float MAX_DAYS = 365F;

	public static final int MIN_WAITING_PERIOD_DAYS = 1;

	public static final float MIN_ACCRUAL_CAP_DAYS = 1F;

	/**
	 * How many completed cycles the carryover chain is walked back before the target
	 * cycle. Carryover is recursive - each cycle's unused days feed the next - so an
	 * unbounded walk would issue one usage query per cycle since the assignment started.
	 * An assignment older than this bound has the carryover from its earliest cycles
	 * dropped, which understates the balance. The understatement is bounded in practice
	 * because {@code maxCarryoverDays} is required whenever carryover is enabled, so the
	 * chain converges on that ceiling within a few cycles.
	 */
	public static final int MAX_CARRYOVER_LOOKBACK_CYCLES = 5;

}
