package com.skapp.community.common.controller.v1;

import com.skapp.community.common.payload.request.NotificationsFilterDto;
import com.skapp.community.common.payload.request.NotificationTypeRequestDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/notification")
public class NotificationController {

	private final NotificationService notificationService;

	@GetMapping
	public ResponseEntity<ResponseEntityDto> getAllNotifications(NotificationsFilterDto notificationsFilterDto) {
		ResponseEntityDto response = notificationService.getAllNotifications(notificationsFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/unread-count")
	public ResponseEntity<ResponseEntityDto> getUnreadNotificationsCount() {
		ResponseEntityDto response = notificationService.getUnreadNotificationsCount();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PatchMapping("/{id}")
	public ResponseEntity<ResponseEntityDto> markNotificationAsRead(@PathVariable Long id) {
		ResponseEntityDto response = notificationService.markNotificationAsRead(id);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PatchMapping
	public ResponseEntity<ResponseEntityDto> markAllNotificationsAsRead() {
		ResponseEntityDto response = notificationService.markAllNotificationsAsRead();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/summary")
	public ResponseEntity<ResponseEntityDto> getNotificationCountByType() {
		ResponseEntityDto response = notificationService.getNotificationCountByType();
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PatchMapping("/summary")
	public ResponseEntity<ResponseEntityDto> markNotificationTypeAsRead(
			@Valid @RequestBody NotificationTypeRequestDto requestDto) {
		ResponseEntityDto response = notificationService.markNotificationTypeAsRead(requestDto.getNotificationType());
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
