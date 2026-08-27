package com.skapp.community.leaveplanner.constant;

import lombok.experimental.UtilityClass;

@UtilityClass
public class LeavePolicyConstant {

	public static final int MAX_NAME_LENGTH = 100;

	public static final float MIN_DAYS = 0.5F;

	public static final float MAX_DAYS = 365F;

	public static final int MIN_WAITING_PERIOD_DAYS = 1;

	public static final float MIN_ACCRUAL_CAP_DAYS = 1F;

	public static final int MAX_BULK_ASSIGN_ROWS = 1000;

	public static final String POLICY_ID_ALIAS = "policyId";

	public static final String ASSIGNED_COUNT_ALIAS = "assignedCount";

}
