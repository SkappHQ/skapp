package com.skapp.community.common.service;

import com.skapp.community.common.model.Notification;

public interface PushNotificationService {

	void sendNotification(Long userId, Notification notification, String title);

}
