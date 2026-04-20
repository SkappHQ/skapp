package com.skapp.community.common.repository;

import com.skapp.community.common.model.Notification;
import com.skapp.community.common.payload.request.NotificationsFilterDto;
import com.skapp.community.common.payload.response.NotificationTypeCountResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository {

	Page<Notification> findAllByUserIDAndNotificationFilterDto(Long userId,
			NotificationsFilterDto notificationsFilterDto, Pageable pageable);

	long countUnreadNotificationsByUserId(Long userId);

	List<NotificationTypeCountResponseDto> countNotificationsByTypeForUser(Long userId);

}
