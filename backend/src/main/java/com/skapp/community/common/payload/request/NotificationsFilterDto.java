package com.skapp.community.common.payload.request;

import com.skapp.community.common.type.NotificationSort;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class NotificationsFilterDto {

	@Min(0)
	private int page = 0;

	@Min(1)
	private int size = 10;

	private Boolean isViewed;

	private Sort.Direction sortOrder = Sort.Direction.DESC;

	private NotificationSort sortKey = NotificationSort.CREATED_DATE;

}
