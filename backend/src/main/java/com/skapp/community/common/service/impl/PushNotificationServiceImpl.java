package com.skapp.community.common.service.impl;

import com.skapp.community.common.component.WebSocketHandler;
import com.skapp.community.common.model.Notification;
import com.skapp.community.common.service.PushNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PushNotificationServiceImpl implements PushNotificationService {

	private final WebSocketHandler webSocketHandler;

	@Override
	public void sendNotification(Long userId, Notification notification, String title) {
		webSocketHandler.sendNotificationToUser(userId.toString(), notification.getBody());
	}

}
