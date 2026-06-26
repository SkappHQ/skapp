package com.skapp.community.common.payload.response;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class NotificationSettingsResponseDto {

	Boolean isLeaveRequestNotificationsEnabled;

	Boolean isTimeEntryNotificationsEnabled;

	Boolean isLeaveRequestNudgeNotificationsEnabled;

}
