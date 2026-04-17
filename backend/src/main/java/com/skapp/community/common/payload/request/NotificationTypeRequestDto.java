package com.skapp.community.common.payload.request;

import com.skapp.community.common.type.NotificationType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NotificationTypeRequestDto {

	private NotificationType notificationType;

}
