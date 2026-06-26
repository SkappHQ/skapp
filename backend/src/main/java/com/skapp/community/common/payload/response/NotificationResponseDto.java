package com.skapp.community.common.payload.response;

import com.skapp.community.common.type.NotificationType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class NotificationResponseDto {

	private Long id;

	private LocalDateTime createdDate;

	private String body;

	private String authPic;

	private Boolean isViewed;

	private Boolean isCausedByCurrentUser;

	private String resourceId;

	private NotificationType notificationType;

}
