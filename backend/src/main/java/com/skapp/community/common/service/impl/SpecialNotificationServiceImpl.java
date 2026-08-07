package com.skapp.community.common.service.impl;

import com.skapp.community.common.model.OrganizationConfig;
import com.skapp.community.common.model.SpecialNotificationStatus;
import com.skapp.community.common.payload.SpecialNotificationConfig;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.repository.SpecialNotificationStatusDao;
import com.skapp.community.common.service.SpecialNotificationService;
import com.skapp.community.common.type.SpecialNotificationType;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpecialNotificationServiceImpl implements SpecialNotificationService {

	private final OrganizationConfigDao organizationConfigDao;

	private final SpecialNotificationStatusDao specialNotificationStatusDao;

	private final EmployeeDao employeeDao;

	private final JsonMapper objectMapper;

	@Override
	@Transactional(readOnly = true)
	public SpecialNotificationConfig getSpecialNotificationConfig(SpecialNotificationType type) {
		return organizationConfigDao
			.findOrganizationConfigByOrganizationConfigType(type.getOrganizationConfigType().name())
			.map(OrganizationConfig::getOrganizationConfigValue)
			.map(configValue -> objectMapper.readValue(configValue, SpecialNotificationConfig.class))
			.orElseGet(SpecialNotificationConfig::new);
	}

	@Override
	@Transactional
	public void saveSpecialNotificationConfig(SpecialNotificationType type, SpecialNotificationConfig config) {
		log.info("saveSpecialNotificationConfig: execution started for type {}", type);

		String configKey = type.getOrganizationConfigType().name();
		String configValue = objectMapper.writeValueAsString(config);

		OrganizationConfig organizationConfig = organizationConfigDao
			.findOrganizationConfigByOrganizationConfigType(configKey)
			.orElseGet(() -> new OrganizationConfig(configKey, configValue));

		organizationConfig.setOrganizationConfigValue(configValue);
		organizationConfigDao.save(organizationConfig);

		log.info("saveSpecialNotificationConfig: execution ended");
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<LocalDate> getLastViewedDate(Long employeeId, SpecialNotificationType type) {
		return specialNotificationStatusDao.findByEmployeeEmployeeIdAndSpecialNotificationType(employeeId, type)
			.map(SpecialNotificationStatus::getLastViewedDate);
	}

	@Override
	@Transactional
	public void markNotificationAsViewed(Long employeeId, SpecialNotificationType type, LocalDate viewedDate) {
		log.info("markNotificationAsViewed: execution started for employee {} and type {}", employeeId, type);

		SpecialNotificationStatus specialNotificationStatus = specialNotificationStatusDao
			.findByEmployeeEmployeeIdAndSpecialNotificationType(employeeId, type)
			.orElseGet(() -> {
				SpecialNotificationStatus newStatus = new SpecialNotificationStatus();
				newStatus.setEmployee(employeeDao.getReferenceById(employeeId));
				newStatus.setSpecialNotificationType(type);
				return newStatus;
			});

		specialNotificationStatus.setLastViewedDate(viewedDate);
		specialNotificationStatusDao.save(specialNotificationStatus);

		log.info("markNotificationAsViewed: execution ended");
	}

}
