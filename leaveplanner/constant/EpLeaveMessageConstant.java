package com.skapp.enterprise.leaveplanner.constant;

import com.skapp.community.common.constant.MessageConstant;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EpLeaveMessageConstant implements MessageConstant {

	EP_LEAVE_CALENDAR_ERROR_LEAVE_REQUEST_NOT_FOUND("ep.leave.calendar.error.leave-request-not-found"),
	EP_LEAVE_CALENDAR_ERROR_TIME_CONFIG_NOT_FOUND("ep.leave.calendar.error.time-config-not-found"),
	EP_LEAVE_CALENDAR_ERROR_AUTO_DECLINE_MODE_NOT_FOUND("ep.leave.calendar.error.auto-decline-mode-not-found"),;

	private final String messageKey;

}
