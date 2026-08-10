package com.skapp.community.common.repository;

import com.skapp.community.common.model.SpecialNotificationStatus;
import com.skapp.community.common.model.SpecialNotificationStatusId;
import com.skapp.community.common.type.SpecialNotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpecialNotificationStatusDao
		extends JpaRepository<SpecialNotificationStatus, SpecialNotificationStatusId> {

	Optional<SpecialNotificationStatus> findByEmployeeEmployeeIdAndSpecialNotificationType(Long employeeId,
			SpecialNotificationType specialNotificationType);

}
