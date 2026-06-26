package com.skapp.community.common.type;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum NotificationSettingsType {

	LEAVE_REQUEST("isLeaveRequestNotificationsEnabled"), TIME_ENTRY("isTimeEntryNotificationsEnabled"),
	LEAVE_REQUEST_NUDGE("isLeaveRequestNudgeNotificationsEnabled");

	private final String key;

}
