package com.skapp.community.peopleplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NotificationSettingsPatchRequestDto {

	Boolean isLeaveRequestNotificationsEnabled;

	Boolean isTimeEntryNotificationsEnabled;

	Boolean isLeaveRequestNudgeNotificationsEnabled;

}
