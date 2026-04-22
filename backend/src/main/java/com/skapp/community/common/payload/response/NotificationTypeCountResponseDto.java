package com.skapp.community.common.payload.response;

import com.skapp.community.common.type.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTypeCountResponseDto {

	private NotificationType notificationType;

	private Long notificationCount;

}
