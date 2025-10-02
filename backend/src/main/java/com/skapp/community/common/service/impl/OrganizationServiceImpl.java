package com.skapp.community.common.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skapp.community.common.constant.CommonConstants;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.mapper.CommonMapper;
import com.skapp.community.common.model.Organization;
import com.skapp.community.common.model.OrganizationConfig;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.request.EmailServerRequestDto;
import com.skapp.community.common.payload.request.OrganizationDto;
import com.skapp.community.common.payload.request.UpdateOrganizationRequestDto;
import com.skapp.community.common.payload.response.EmailServerConfigResponseDto;
import com.skapp.community.common.payload.response.OrganizationConfigResponseDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.service.OrganizationService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.OrganizationConfigType;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.leaveplanner.service.LeaveCycleService;
import com.skapp.community.leaveplanner.service.LeaveTypeService;
import com.skapp.community.okrplanner.service.OkrConfigService;
import com.skapp.community.timeplanner.model.TimeConfig;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import com.skapp.community.timeplanner.service.AttendanceConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.skapp.community.common.util.Validation.isValidThemeColor;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrganizationServiceImpl implements OrganizationService {

	private final OrganizationDao organizationDao;

	private final CommonMapper commonMapper;

	private final MessageUtil messageUtil;

	protected final AttendanceConfigService attendanceConfigService;

	protected final LeaveTypeService leaveTypeService;

	protected final LeaveCycleService leaveCycleService;

	private final UserService userService;

	protected final OrganizationConfigDao organizationConfigDao;

	protected final ObjectMapper objectMapper;

	private final EncryptionDecryptionService encryptionDecryptionService;

	private final TimeConfigDao timeConfigDao;

	private final OkrConfigService okrConfigService;

	@Value("${encryptDecryptAlgorithm.secret}")
	private String encryptSecret;

	private static void setOrganizationDetails(UpdateOrganizationRequestDto organizationDto,
			Organization organization) {
		if (organizationDto.getOrganizationName() != null && !organizationDto.getOrganizationName().isBlank()) {
			organization.setOrganizationName(organizationDto.getOrganizationName());
		}

		if (organizationDto.getCountry() != null && !organizationDto.getCountry().isBlank()) {
			organization.setCountry(organizationDto.getCountry());
		}

		if (organizationDto.getThemeColor() != null && !organizationDto.getThemeColor().isBlank()) {
			organization.setThemeColor(organizationDto.getThemeColor());
		}

		if (organizationDto.getOrganizationWebsite() != null) {
			organization.setOrganizationWebsite(organizationDto.getOrganizationWebsite());
		}

		if (organizationDto.getOrganizationLogo() != null) {
			organization.setOrganizationLogo(organizationDto.getOrganizationLogo());
		}
	}

	@Override
	public ResponseEntityDto saveOrganization(OrganizationDto organizationDto) {
		User currentUser = userService.getCurrentUser();
		log.info("saveOrganization: execution started by user: {}", currentUser.getUserId());

		if (organizationDto.getThemeColor() != null && !isValidThemeColor(organizationDto.getThemeColor()))
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_ORGANIZATION_THEME_COLOR_FORMAT_INVALID);

		if (organizationDao.count() > 0)
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_EXCEED_MAX_ORGANIZATION_COUNT);

		organizationDao.save(commonMapper.organizationDtoToOrganization(organizationDto));

		setDefaultOrganizationConfigs();

		log.info("saveOrganization: execution ended");
		return new ResponseEntityDto(messageUtil.getMessage(CommonMessageConstant.COMMON_SUCCESS_ORGANIZATION_CREATE),
				false);
	}

	@Override
	public ResponseEntityDto getOrganization() {
		User currentUser = userService.getCurrentUser();
		log.info("getOrganization: execution started by user: {}", currentUser.getUserId());

		Optional<Organization> organization = organizationDao.findTopByOrderByOrganizationIdDesc();
		return organization
			.map(value -> new ResponseEntityDto(false, commonMapper.organizationToOrganizationResponseDto(value)))
			.orElseGet(ResponseEntityDto::new);

	}

	@Override
	public ResponseEntityDto saveEmailServerConfigs(EmailServerRequestDto emailServerRequestDto) {
		log.info("saveEmailServerConfigs: execution started");

		Optional<OrganizationConfig> existingConfigOptional = organizationConfigDao
			.findOrganizationConfigByOrganizationConfigType(OrganizationConfigType.EMAIL_CONFIGS.name());

		try {
			emailServerRequestDto.setAppPassword(
					encryptionDecryptionService.encrypt(emailServerRequestDto.getAppPassword(), encryptSecret));

			String updatedJsonEmailServiceConfigs = objectMapper.writeValueAsString(emailServerRequestDto);
			OrganizationConfig organizationConfig = existingConfigOptional
				.orElseGet(() -> new OrganizationConfig(OrganizationConfigType.EMAIL_CONFIGS.name(),
						updatedJsonEmailServiceConfigs));

			organizationConfig.setOrganizationConfigValue(updatedJsonEmailServiceConfigs);
			organizationConfigDao.save(organizationConfig);

			log.info("saveEmailServerConfigs: execution ended successfully");

			EmailServerConfigResponseDto responseDto = objectMapper.convertValue(emailServerRequestDto,
					EmailServerConfigResponseDto.class);
			return new ResponseEntityDto(false, responseDto);

		}
		catch (JsonProcessingException e) {
			log.error("Error converting email server configuration to JSON: {}", e.getMessage());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_JSON_STRING_TO_OBJECT_CONVERSION_FAILED);
		}
	}

	@Override
	public EmailServerConfigResponseDto getEmailServiceConfigs() {
		log.info("getEmailServiceConfigs: execution started");

		Optional<OrganizationConfig> configOptional = organizationConfigDao
			.findOrganizationConfigByOrganizationConfigType(OrganizationConfigType.EMAIL_CONFIGS.name());

		if (configOptional.isEmpty()) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_EMAIL_CONFIG_NOT_FOUND);
		}

		String jsonEmailServiceConfigs = configOptional.get().getOrganizationConfigValue();
		try {
			EmailServerConfigResponseDto emailConfigDto = objectMapper.readValue(jsonEmailServiceConfigs,
					EmailServerConfigResponseDto.class);

			emailConfigDto
				.setAppPassword(encryptionDecryptionService.decrypt(emailConfigDto.getAppPassword(), encryptSecret));

			log.info("getEmailServiceConfigs: execution ended successfully");
			return emailConfigDto;
		}
		catch (JsonProcessingException e) {
			log.error("Error parsing email service configs JSON: {}", e.getMessage());
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_JSON_STRING_TO_OBJECT_CONVERSION_FAILED);
		}
	}

	@Override
	public ResponseEntityDto getOrganizationConfigs() {
		log.info("getOrganizationConfigs: execution started");

		OrganizationConfigResponseDto organizationConfigResponseDto = new OrganizationConfigResponseDto();
		organizationConfigResponseDto.setEmailConfigs(getEmailServiceConfigs());

		log.info("getOrganizationConfigs: execution ended");
		return new ResponseEntityDto(false, organizationConfigResponseDto);
	}

	public ResponseEntityDto updateOrganization(UpdateOrganizationRequestDto organizationDto) {
		Optional<Organization> organizationOpt = organizationDao.findTopByOrderByOrganizationIdDesc();
		if (organizationOpt.isPresent()) {
			if (organizationDto.getThemeColor() != null && !isValidThemeColor(organizationDto.getThemeColor()))
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_ORGANIZATION_THEME_COLOR_FORMAT_INVALID);
			Organization organization = organizationOpt.get();
			setOrganizationDetails(organizationDto, organization);
			organizationDao.save(organization);
			return new ResponseEntityDto(false, commonMapper.organizationToOrganizationResponseDto(organization));
		}
		else {
			return new ResponseEntityDto(false, "Organization is not updated successfully");
		}
	}

	private void setDefaultOrganizationConfigs() {
		log.info("setDefaultOrganizationConfigs: execution started");

		attendanceConfigService.setDefaultAttendanceConfig();
		getDefaultTimeConfigs();
		leaveTypeService.createDefaultLeaveType();
		leaveCycleService.setLeaveCycleDefaultConfigs();
		okrConfigService.setOkrDefaultConfig();
		saveEmailServerConfigs(new EmailServerRequestDto(null, null, null, null, false));

		log.info("setDefaultOrganizationConfigs: execution ended");
	}

	@Override
	public String getOrganizationTimeZone() {
		return organizationDao.findTopByOrderByOrganizationIdDesc()
			.map(Organization::getOrganizationTimeZone)
			.orElse("UTC");
	}

	public void getDefaultTimeConfigs() {
		List<TimeConfig> timeConfigs = new ArrayList<>();
		List<DayOfWeek> daysOfWeek = List.of(DayOfWeek.values());
		daysOfWeek.forEach(dayOfWeek -> {
			TimeConfig newTimeConfig = new TimeConfig();
			newTimeConfig.setDay(dayOfWeek);

			ArrayNode arrayNode = objectMapper.createArrayNode();
			ObjectNode objectNodeMorning = objectMapper.createObjectNode();
			ObjectNode objectNodeEvening = objectMapper.createObjectNode();

			objectNodeMorning.put(CommonConstants.DEFAULT_TIME_CONFIG_KEY_HOUR,
					CommonConstants.DEFAULT_TIME_CONFIG_VALUE_HOUR);
			objectNodeMorning.put(CommonConstants.DEFAULT_TIME_CONFIG_KEY_TIME_BLOCK,
					CommonConstants.DEFAULT_TIME_CONFIG_VALUE_MORNING);
			objectNodeEvening.put(CommonConstants.DEFAULT_TIME_CONFIG_KEY_HOUR,
					CommonConstants.DEFAULT_TIME_CONFIG_VALUE_HOUR);
			objectNodeEvening.put(CommonConstants.DEFAULT_TIME_CONFIG_KEY_TIME_BLOCK,
					CommonConstants.DEFAULT_TIME_CONFIG_VALUE_EVENING);

			// Add objects to the array node
			arrayNode.add(objectNodeMorning);
			arrayNode.add(objectNodeEvening);
			newTimeConfig.setTimeBlocks(arrayNode);
			newTimeConfig.setTotalHours(CommonConstants.DEFAULT_TIME_CONFIG_VALUE_TOTAL_HOUR);
			newTimeConfig.setStartHour(CommonConstants.DEFAULT_TIME_CONFIG_VALUE_START_HOUR);
			newTimeConfig.setStartMinute(CommonConstants.DEFAULT_TIME_CONFIG_VALUE_START_MINUTE);
			newTimeConfig.setIsWeekStartDay(dayOfWeek.name().equals(DayOfWeek.MONDAY.name()));
			timeConfigs.add(newTimeConfig);
		});

		timeConfigDao.saveAll(timeConfigs);

	}

}
