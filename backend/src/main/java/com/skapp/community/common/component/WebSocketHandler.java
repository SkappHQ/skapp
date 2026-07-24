package com.skapp.community.common.component;

import com.skapp.community.common.constant.AuthConstants;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.security.Principal;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class WebSocketHandler extends TextWebSocketHandler {

	private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

	@Override
	public void afterConnectionEstablished(@NonNull WebSocketSession session) {
		String userId = (String) session.getAttributes().get(AuthConstants.USER_ID);

		WebSocketSession existingSession = sessions.get(userId);
		if (existingSession != null && existingSession.isOpen()) {
			try {
				existingSession.close(CloseStatus.NORMAL);
				log.info("Closed previous WebSocket session for userId: {}", userId);
			}
			catch (IOException e) {
				log.error("Error while closing previous session for userId: {}", userId);
			}
		}

		sessions.put(userId, session);
		log.info("WebSocket connection established for userId: {}", userId);
	}

	@Override
	protected void handleTextMessage(@NonNull WebSocketSession session, @NonNull TextMessage message) {
		log.info("Received message: {}", message.getPayload());
	}

	@Override
	public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull CloseStatus status) {
		try (session) {
			String userId = getUserIdFromSession(session);
			sessions.remove(userId);
		}
		catch (Exception e) {
			log.error("Error closing WebSocket session", e);
		}
	}

	public void sendNotificationToUser(String userId, String message) {
		WebSocketSession session = sessions.get(userId);
		if (session != null && session.isOpen()) {
			try {
				session.sendMessage(new TextMessage(message));
			}
			catch (IOException e) {
				log.error("sendNotificationToUser: Unable to send the message: {}", e.getMessage());
			}
		}
	}

	private String getUserIdFromSession(WebSocketSession session) {
		if (session == null) {
			return null;
		}

		String userId = (String) session.getAttributes().get(AuthConstants.USER_ID);

		Principal principal = session.getPrincipal();
		if (userId == null && principal != null) {
			userId = principal.getName();
		}

		return userId;
	}

}
