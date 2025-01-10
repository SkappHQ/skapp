package com.skapp.enterprise.common.service.impl;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MessagingErrorCode;
import com.skapp.community.common.model.Notification;
import com.skapp.community.common.service.PushNotificationService;
import com.skapp.enterprise.common.model.DeviceToken;
import com.skapp.enterprise.common.repository.DeviceTokenDao;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class EpPushNotificationServiceImpl implements PushNotificationService {

	@NonNull
	private final FirebaseMessaging firebaseMessaging;

	@NonNull
	private final DeviceTokenDao deviceTokenDao;

	@Override
	public void sendNotification(Long userId, Notification notification) {
		List<DeviceToken> deviceTokens = deviceTokenDao.findAllByUserId(userId);
		log.info("sendNotification: Device tokens fetched successfully, {}", deviceTokens);
		com.google.firebase.messaging.Notification firebaseNotification = com.google.firebase.messaging.Notification
			.builder()
			.setBody(notification.getBody())
			.build();

		log.info("sendNotification: Sending push notification to all devices {}", firebaseNotification);

		for (DeviceToken deviceToken : deviceTokens) {
			boolean response = sendNotification(firebaseNotification, deviceToken.getToken());
			log.error("sendNotification: Response: {}", response);
			if (!response) {
				deviceTokenDao.delete(deviceToken);
				log.error("sendNotification: Device token deleted successfully");
			}
		}

	}

	private boolean sendNotification(com.google.firebase.messaging.Notification notification, String token) {
		try {
			Message message = Message.builder().setNotification(notification).setToken(token).build();
			log.info("sendNotification: Sending push notification to device message: {}", message);
			String receivedResponse = firebaseMessaging.send(message);
			log.info("sendNotification: Push notification sent successfully to device: {}", receivedResponse);
		}
		catch (FirebaseMessagingException e) {
			log.error("sendNotification: An exception occurred while sending a push notification:" + " {}",
					e.getMessage());
			MessagingErrorCode exceptionErrorCode = e.getMessagingErrorCode();
			if (exceptionErrorCode.equals(MessagingErrorCode.UNREGISTERED)
					|| exceptionErrorCode.equals(MessagingErrorCode.INVALID_ARGUMENT)) {
				return false;
			}
		}
		catch (Exception e) {
			log.error("sendNotification: Generic Exception:" + " {}", e.getMessage());
			return false;
		}

		return true;
	}

}
