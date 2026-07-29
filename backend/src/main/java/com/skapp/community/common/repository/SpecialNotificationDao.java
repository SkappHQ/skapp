package com.skapp.community.common.repository;

import com.skapp.community.common.model.SpecialNotification;
import com.skapp.community.common.model.SpecialNotificationId;
import com.skapp.community.common.type.SpecialNotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpecialNotificationDao extends JpaRepository<SpecialNotification, SpecialNotificationId> {

	Optional<SpecialNotification> findByEmployeeEmployeeIdAndSpecialNotificationType(Long employeeId,
			SpecialNotificationType specialNotificationType);

}
