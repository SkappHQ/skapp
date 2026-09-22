package com.skapp.community.common.service;

import com.skapp.community.common.payload.SpecialNotificationConfig;
import com.skapp.community.common.type.SpecialNotificationType;

import java.time.LocalDate;
import java.util.Optional;

public interface SpecialNotificationService {

	SpecialNotificationConfig getSpecialNotificationConfig(SpecialNotificationType type);

	void saveSpecialNotificationConfig(SpecialNotificationType type, SpecialNotificationConfig config);

	Optional<LocalDate> getLastViewedDate(Long employeeId, SpecialNotificationType type);

	void markNotificationAsViewed(Long employeeId, SpecialNotificationType type, LocalDate viewedDate);

}
