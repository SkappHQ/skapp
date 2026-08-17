package com.skapp.community.leaveplanner.constant;

import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import lombok.experimental.UtilityClass;

import java.util.List;
import java.util.Map;
import java.util.Set;

@UtilityClass
public class PolicyLeaveConstant {

	public static final List<LeaveRequestStatus> BALANCE_HOLDING_STATUSES = List.of(LeaveRequestStatus.PENDING,
			LeaveRequestStatus.APPROVED);

	public static final Map<LeaveRequestStatus, Set<LeaveRequestStatus>> REVIEWER_STATUS_TRANSITIONS = Map.of(
			LeaveRequestStatus.PENDING, Set.of(LeaveRequestStatus.APPROVED, LeaveRequestStatus.DENIED),
			LeaveRequestStatus.APPROVED, Set.of(LeaveRequestStatus.REVOKED));

	public static final Map<LeaveRequestStatus, Set<LeaveRequestStatus>> OWNER_STATUS_TRANSITIONS = Map
		.of(LeaveRequestStatus.PENDING, Set.of(LeaveRequestStatus.CANCELLED));

	public static final int MAX_REQUEST_DESCRIPTION_LENGTH = 255;

	public static final int MAX_REVIEWER_COMMENT_LENGTH = 255;

	public static final int MAX_ATTACHMENTS = 5;

	public static final int MAX_ATTACHMENT_URL_LENGTH = 1000;

	public static final int MAX_SEARCH_KEYWORD_LENGTH = 100;

	/**
	 * How far either side of the current year a requested leave cycle year may sit.
	 * Guards the cycle resolution arithmetic, which throws a {@code DateTimeException} on
	 * years outside the supported range.
	 */
	public static final int MAX_CYCLE_YEAR_OFFSET = 10;

}
