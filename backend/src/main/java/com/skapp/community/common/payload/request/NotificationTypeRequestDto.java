package com.skapp.community.common.payload.request;

import com.skapp.community.common.type.NotificationType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NotificationTypeRequestDto {

	@NotNull
	private NotificationType notificationType;

}
