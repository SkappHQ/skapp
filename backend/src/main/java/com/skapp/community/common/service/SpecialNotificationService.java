package com.skapp.community.common.service;

import com.skapp.community.common.payload.SpecialNotificationConfig;
import com.skapp.community.common.type.SpecialNotificationType;

import java.time.LocalDate;
import java.util.Optional;

public interface SpecialNotificationService {

	<T extends SpecialNotificationConfig> T getConfig(SpecialNotificationType type, Class<T> configClass);

	void saveConfig(SpecialNotificationType type, SpecialNotificationConfig config);

	Optional<LocalDate> getLastViewedDate(Long employeeId, SpecialNotificationType type);

	void markNotificationViewed(Long employeeId, SpecialNotificationType type, LocalDate viewedDate);

}
