package com.skapp.community.leaveplanner.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class LeaveNotificationNudgeResponseDto {

	private Boolean isNudge;

	private LocalDateTime lastNudgedDateTime;

}
