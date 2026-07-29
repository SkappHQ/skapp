package com.skapp.community.common.service.impl;

import com.skapp.community.common.model.OrganizationConfig;
import com.skapp.community.common.model.SpecialNotification;
import com.skapp.community.common.payload.SpecialNotificationConfig;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.repository.SpecialNotificationDao;
import com.skapp.community.common.service.SpecialNotificationService;
import com.skapp.community.common.type.SpecialNotificationType;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
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

	private final SpecialNotificationDao specialNotificationDao;

	private final EmployeeDao employeeDao;

	private final JsonMapper objectMapper;

	@Override
	@Transactional(readOnly = true)
	public <T extends SpecialNotificationConfig> T getConfig(SpecialNotificationType type, Class<T> configClass) {
		String configValue = organizationConfigDao
			.findOrganizationConfigByOrganizationConfigType(type.getOrganizationConfigType().name())
			.map(OrganizationConfig::getOrganizationConfigValue)
			.orElse("{}");

		return objectMapper.readValue(configValue, configClass);
	}

	@Override
	@Transactional
	public void saveConfig(SpecialNotificationType type, SpecialNotificationConfig config) {
		log.info("saveConfig: execution started for type {}", type);

		String configKey = type.getOrganizationConfigType().name();
		String configValue = objectMapper.writeValueAsString(config);

		OrganizationConfig organizationConfig = organizationConfigDao
			.findOrganizationConfigByOrganizationConfigType(configKey)
			.orElseGet(() -> new OrganizationConfig(configKey, configValue));
		organizationConfig.setOrganizationConfigValue(configValue);
		organizationConfigDao.save(organizationConfig);

		log.info("saveConfig: execution ended");
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<LocalDate> getLastViewedDate(Long employeeId, SpecialNotificationType type) {
		return specialNotificationDao.findByEmployeeEmployeeIdAndSpecialNotificationType(employeeId, type)
			.map(SpecialNotification::getLastViewedDate);
	}

	@Override
	@Transactional
	public void markNotificationViewed(Long employeeId, SpecialNotificationType type, LocalDate viewedDate) {
		log.info("markNotificationViewed: execution started for employee {} and type {}", employeeId, type);

		SpecialNotification specialNotification = specialNotificationDao
			.findByEmployeeEmployeeIdAndSpecialNotificationType(employeeId, type)
			.orElseGet(() -> {
				SpecialNotification newNotification = new SpecialNotification();
				newNotification.setEmployee(employeeDao.getReferenceById(employeeId));
				newNotification.setSpecialNotificationType(type);
				return newNotification;
			});
		specialNotification.setLastViewedDate(viewedDate);

		try {
			specialNotificationDao.saveAndFlush(specialNotification);
		}
		catch (DataIntegrityViolationException e) {
			log.warn(
					"markNotificationViewed: concurrent write detected for employee {} and type {}, treating as success",
					employeeId, type);
		}

		log.info("markNotificationViewed: execution ended");
	}

}
