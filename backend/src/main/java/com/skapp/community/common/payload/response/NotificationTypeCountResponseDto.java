package com.skapp.community.common.payload.response;

import com.skapp.community.common.type.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NotificationTypeCountResponseDto {

	private NotificationType notificationType;

	private Long notificationCount;

}
