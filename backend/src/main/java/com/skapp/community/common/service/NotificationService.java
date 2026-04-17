package com.skapp.community.common.service;

import com.skapp.community.common.payload.request.NotificationsFilterDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.NotificationCategory;
import com.skapp.community.common.type.NotificationType;
import com.skapp.community.peopleplanner.model.Employee;

public interface NotificationService {

	void createNotification(Employee employee, String resourceId, NotificationType notificationType,
			EmailBodyTemplates emailBodyTemplates, Object commonEmailDynamicFields,
			NotificationCategory notificationCategory);

	ResponseEntityDto getAllNotifications(NotificationsFilterDto notificationsFilterDto);

	ResponseEntityDto markNotificationAsRead(Long id);

	ResponseEntityDto markAllNotificationsAsRead();

	ResponseEntityDto getUnreadNotificationsCount();

	ResponseEntityDto getNotificationCountByType();

	ResponseEntityDto markNotificationTypeAsViewed(NotificationType notificationType);

}
