package com.skapp.community.common.repository;

import com.skapp.community.common.model.Notification;
import com.skapp.community.common.type.NotificationType;
import com.skapp.community.peopleplanner.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationDao extends JpaRepository<Notification, Long>, NotificationRepository {

	List<Notification> findByEmployee(Employee employee);

	Notification findFirstByResourceIdAndNotificationTypeOrderByCreatedDateDesc(String leaveRequestId,
			NotificationType notificationType);

}
