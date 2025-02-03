package com.skapp.enterprise.leaveplanner.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EpOutOfOfficeEventRequestDto {

	private Long leaveId;

	private Boolean isAutoDeclineExistingEventsOnLeaveEnabled;

	private String declineMessage;

}
