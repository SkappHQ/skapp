package com.skapp.community.leaveplanner.constant;

import com.skapp.community.leaveplanner.type.LeaveRequestStatus;
import lombok.experimental.UtilityClass;

import java.util.List;

@UtilityClass
public class PolicyLeaveConstant {

	public static final List<LeaveRequestStatus> BALANCE_HOLDING_STATUSES = List.of(LeaveRequestStatus.PENDING,
			LeaveRequestStatus.APPROVED);

	public static final int MAX_REQUEST_DESCRIPTION_LENGTH = 255;

	public static final int MAX_REVIEWER_COMMENT_LENGTH = 255;

	public static final int MAX_ATTACHMENTS = 5;

	public static final int MAX_ATTACHMENT_URL_LENGTH = 1000;

	public static final int MAX_SEARCH_KEYWORD_LENGTH = 100;

	/**
	 * Hard cap on the unpaged pending review feed so one manager with a large backlog
	 * cannot pull the whole table into memory.
	 */
	public static final int MAX_PENDING_REQUESTS = 200;

}
