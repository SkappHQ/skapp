package com.skapp.enterprise.common.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.mapper.CommonMapper;
import com.skapp.community.common.model.OrganizationConfig;
import com.skapp.community.common.model.User;
import com.skapp.community.common.model.UserSettings;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.OrganizationConfigDao;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.CacheService;
import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.service.impl.OrganizationServiceImpl;
import com.skapp.community.common.type.CacheKey;
import com.skapp.community.common.type.NotificationSettingsType;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.event.UserCreatedEvent;
import com.skapp.community.leaveplanner.service.LeaveCycleService;
import com.skapp.community.leaveplanner.service.LeaveTypeService;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.community.timeplanner.repository.TimeConfigDao;
import com.skapp.community.timeplanner.service.AttendanceConfigService;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.constant.EpValidationConstants;
import com.skapp.enterprise.common.mapper.EpCommonMapper;
import com.skapp.enterprise.common.masterrepository.SuperAdminDao;
import com.skapp.enterprise.common.model.EpOrganization;
import com.skapp.enterprise.common.model.OrganizationCalendar;
import com.skapp.enterprise.common.model.master.SuperAdmin;
import com.skapp.enterprise.common.payload.request.EpCalendarConfigRequestDto;
import com.skapp.enterprise.common.payload.request.EpOrganizationDto;
import com.skapp.enterprise.common.payload.response.EpCalendarConfigResponseDto;
import com.skapp.enterprise.common.payload.response.EpOrganizationResponseDto;
import com.skapp.enterprise.common.repository.EpOrganizationCalenderDao;
import com.skapp.enterprise.common.repository.EpOrganizationConfigDao;
import com.skapp.enterprise.common.repository.EpOrganizationDao;
import com.skapp.enterprise.common.service.DashboardEmailService;
import com.skapp.enterprise.common.service.EpCommonEmailService;
import com.skapp.enterprise.common.service.EpOrganizationService;
import com.skapp.enterprise.common.service.TenantService;
import com.skapp.enterprise.common.type.EpCacheKeys;
import com.skapp.enterprise.common.type.EpOrganizationConfigType;
import com.skapp.enterprise.esignature.service.EsignConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static com.skapp.community.common.util.Validation.isValidOrganizationTimeZone;
import static com.skapp.community.common.util.Validation.isValidThemeColor;

@Primary
@Service
@Slf4j
public class EpOrganizationServiceImpl extends OrganizationServiceImpl implements EpOrganizationService {

	private final EpOrganizationDao epOrganizationDao;

	private final AttendanceConfigService attendanceConfigService;

	private final EpCommonEmailService emailService;

	private final LeaveTypeService leaveTypeService;

	private final LeaveCycleService leaveCycleService;

	private final TenantService tenantService;

	private final TenantContext tenantContext;

	private final EpCommonMapper epCommonMapper;

	private final SuperAdminDao superAdminDao;

	private final UserDao userDao;

	private final ApplicationEventPublisher applicationEventPublisher;

	private final EpOrganizationCalenderDao epOrganizationCalenderDao;

	private final ObjectMapper objectMapper;

	private final OrganizationConfigDao organizationConfigDao;

	private final EpOrganizationConfigDao epOrganizationConfigDao;

	private final EsignConfigService esignConfigService;

	private final CacheService cacheService;

	private final DashboardEmailService dashboardEmailService;

	@Value("${aws.route53.parent-domain}")
	private String parentDomain;

	@Value("${organization.email}")
	private String organizationEmail;

	public EpOrganizationServiceImpl(OrganizationDao organizationDao, CommonMapper commonMapper,
			MessageUtil messageUtil, AttendanceConfigService attendanceConfigService, LeaveTypeService leaveTypeService,
			LeaveCycleService leaveCycleService, UserService userService, OrganizationConfigDao organizationConfigDao,
			ObjectMapper objectMapper, EncryptionDecryptionService encryptionDecryptionService,
			TimeConfigDao timeConfigDao, EpOrganizationDao epOrganizationDao, EpCommonEmailService emailService,
			TenantService tenantService, TenantContext tenantContext, EpCommonMapper epCommonMapper,
			SuperAdminDao superAdminDao, UserDao userDao, ApplicationEventPublisher applicationEventPublisher,
			EpOrganizationCalenderDao epOrganizationCalenderDao, EpOrganizationConfigDao epOrganizationConfigDao,
			EsignConfigService esignConfigService, CacheService cacheService,
			DashboardEmailService dashboardEmailService) {
		super(organizationDao, commonMapper, messageUtil, attendanceConfigService, leaveTypeService, leaveCycleService,
				userService, organizationConfigDao, objectMapper, encryptionDecryptionService, timeConfigDao);
		this.epOrganizationDao = epOrganizationDao;
		this.attendanceConfigService = attendanceConfigService;
		this.emailService = emailService;
		this.leaveTypeService = leaveTypeService;
		this.leaveCycleService = leaveCycleService;
		this.tenantService = tenantService;
		this.tenantContext = tenantContext;
		this.epCommonMapper = epCommonMapper;
		this.superAdminDao = superAdminDao;
		this.userDao = userDao;
		this.applicationEventPublisher = applicationEventPublisher;
		this.epOrganizationCalenderDao = epOrganizationCalenderDao;
		this.objectMapper = objectMapper;
		this.organizationConfigDao = organizationConfigDao;
		this.epOrganizationConfigDao = epOrganizationConfigDao;
		this.esignConfigService = esignConfigService;
		this.cacheService = cacheService;
		this.dashboardEmailService = dashboardEmailService;
	}

	@Override
	public ResponseEntityDto saveOrganization(EpOrganizationDto organizationDto) {
		validateOrganizationInput(organizationDto);
		String companyDomain = organizationDto.getCompanyDomain();
		boolean tenantCreated = false;

		try {
			Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
			SuperAdmin superAdmin = superAdminDao.findById(userId)
				.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUPER_ADMIN_NOR_FOUND));

			tenantService.createTenant(companyDomain, superAdmin.getLoginMethod(), superAdmin.getEmail());
			tenantCreated = true;

			log.info("Tenant created for: {}", companyDomain);

			tenantContext.setTenantAndSwitchSchema(companyDomain);
			epOrganizationDao.save(epCommonMapper.epOrganizationDtoToEPOrganization(organizationDto));
			log.info("Organization saved for: {}", companyDomain);

			EpOrganization epOrganization = epOrganizationDao.findTopByOrderByOrganizationIdDesc();

			setDefaultOrganizationConfigsForEp();

			User savedUser = createSuperAdminUser(superAdmin);
			log.info("Super admin user created for: {}", companyDomain);
			applicationEventPublisher.publishEvent(new UserCreatedEvent(this, savedUser));

			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
			superAdminDao.delete(superAdmin);
			log.info("SuperAdmin deleted after successful organization creation.");

			tenantContext.setTenantAndSwitchSchema(companyDomain);

			EpOrganizationResponseDto responseDto = buildOrganizationResponse(epOrganization, companyDomain);
			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

			emailService.sendTenantUrlEmail(superAdmin, companyDomain, organizationDto.getOrganizationName());

			String superAdminEmail = superAdmin.getEmail();

			String signedUpDateTime = java.time.LocalDateTime.now().toString();

			dashboardEmailService.sendNewOrganizationCreatedEmail(organizationEmail,
					organizationDto.getOrganizationName(), organizationDto.getCompanyDomain(), signedUpDateTime,
					superAdminEmail);

			return new ResponseEntityDto(false, responseDto);

		}
		catch (Exception e) {
			log.error("Error creating organization: {}", e.getMessage(), e);

			try {
				cleanup(companyDomain, tenantCreated);
			}
			catch (ModuleException cleanupException) {
				log.error("Cleanup failed: {}", cleanupException.getMessage());
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_ORGANIZATION_CLEANUP_FAILED);
			}

			if (e instanceof ModuleException moduleException) {
				throw moduleException;
			}

			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_ORGANIZATION_CREATE);
		}
	}

	@Override
	public ResponseEntityDto getTenantLoginType(String tenantName) {
		log.info("getTenantLoginType executed by: {}", tenantName);
		return tenantService.getTenant(tenantName);
	}

	@Override
	public ResponseEntityDto editCalendarConfigs(EpCalendarConfigRequestDto epCalendarConfigRequestDto) {
		log.info("editCalendarConfigs: execution started");

		if (epCalendarConfigRequestDto.getIsGoogleCalendarEnabled() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CALENDAR_CONFIG_CANNOT_BE_EMPTY);
		}

		List<OrganizationCalendar> organizationCalendars = epOrganizationCalenderDao.findAll();

		if (organizationCalendars.isEmpty()) {
			OrganizationCalendar newCalendar = new OrganizationCalendar();
			newCalendar.setIsGoogleCalendarEnabled(epCalendarConfigRequestDto.getIsGoogleCalendarEnabled());
			epOrganizationCalenderDao.save(newCalendar);
			return new ResponseEntityDto(false, newCalendar);
		}
		else {
			OrganizationCalendar existingOrganizationCalendar = organizationCalendars.getFirst();

			if (!Objects.equals(existingOrganizationCalendar.getIsGoogleCalendarEnabled(),
					epCalendarConfigRequestDto.getIsGoogleCalendarEnabled())) {

				epOrganizationCalenderDao.delete(existingOrganizationCalendar);

				OrganizationCalendar newCalendar = new OrganizationCalendar();
				newCalendar.setIsGoogleCalendarEnabled(epCalendarConfigRequestDto.getIsGoogleCalendarEnabled());
				epOrganizationCalenderDao.save(newCalendar);

				log.info("editCalendarConfigs: execution ended successfully");
				return new ResponseEntityDto(false, newCalendar);
			}

			else {
				return new ResponseEntityDto(false, existingOrganizationCalendar);
			}
		}
	}

	@Override
	public ResponseEntityDto getCalendarConfigs() {
		log.info("getCalendarConfigs: execution started");

		List<OrganizationCalendar> organizationCalendars = epOrganizationCalenderDao.findAll();

		if (organizationCalendars.isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_CALENDAR_CONFIG_NOT_FOUND);
		}

		EpCalendarConfigResponseDto epCalendarConfigResponseDto = epCommonMapper
			.organizationCalendarToEpCalendarConfigResponseDto(organizationCalendars.getFirst());

		return new ResponseEntityDto(false, epCalendarConfigResponseDto);
	}

	@Override
	public ResponseEntityDto setQuickSetupCompleted() {
		log.info("setQuickSetupCompleted: execution started");

		Optional<OrganizationConfig> existingQuickSetupCompletion = epOrganizationConfigDao
			.findOrganizationConfigByOrganizationConfigType(EpOrganizationConfigType.QUICK_SETUP_STATUS.name());

		if (existingQuickSetupCompletion.isPresent()
				&& existingQuickSetupCompletion.get().getOrganizationConfigValue().equals(Boolean.TRUE.toString()))
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_QUICK_SETUP_ALREADY_COMPLETED);

		String quickSetupCompleted = String.valueOf(true);
		OrganizationConfig organizationConfig = new OrganizationConfig(
				EpOrganizationConfigType.QUICK_SETUP_STATUS.name(), quickSetupCompleted);
		organizationConfigDao.save(organizationConfig);

		log.info("setQuickSetupCompleted: execution ended successfully");

		return new ResponseEntityDto(false, organizationConfig);
	}

	private User createSuperAdminUser(SuperAdmin superAdmin) {
		User user = new User();
		user.setEmail(superAdmin.getEmail());
		user.setPassword(superAdmin.getPassword());
		user.setIsActive(true);
		user.setLoginMethod(superAdmin.getLoginMethod());
		user.setIsPasswordChangedForTheFirstTime(true);

		Employee employee = new Employee();
		employee.setFirstName(superAdmin.getFirstName());
		employee.setLastName(superAdmin.getLastName());
		employee.setAccountStatus(AccountStatus.ACTIVE);
		employee.setEmploymentAllocation(EmploymentAllocation.FULL_TIME);
		employee.setAuthPic(superAdmin.getAuthPic());

		EmployeeRole superAdminRoles = new EmployeeRole();
		superAdminRoles.setPeopleRole(Role.PEOPLE_ADMIN);
		superAdminRoles.setLeaveRole(Role.LEAVE_ADMIN);
		superAdminRoles.setAttendanceRole(Role.ATTENDANCE_ADMIN);
		superAdminRoles.setEsignRole(Role.ESIGN_ADMIN);
		superAdminRoles.setIsSuperAdmin(true);
		superAdminRoles.setChangedDate(DateTimeUtils.getCurrentUtcDate());

		user.setEmployee(employee);
		employee.setUser(user);
		employee.setEmployeeRole(superAdminRoles);
		superAdminRoles.setEmployee(employee);
		superAdminRoles.setRoleChangedBy(employee);

		UserSettings userSettings = createNotificationSettings(user);
		user.setSettings(userSettings);

		return userDao.save(user);
	}

	private UserSettings createNotificationSettings(User user) {
		log.info("createNotificationSettings: execution started {}", user.getUserId());
		UserSettings userSettings = new UserSettings();

		ObjectNode notificationsObjectNode = objectMapper.createObjectNode();

		boolean isLeaveRequestNotificationsEnabled = true;
		boolean isTimeEntryNotificationsEnabled = true;
		boolean isNudgeNotificationsEnabled = true;

		notificationsObjectNode.put(NotificationSettingsType.LEAVE_REQUEST.getKey(),
				isLeaveRequestNotificationsEnabled);
		notificationsObjectNode.put(NotificationSettingsType.TIME_ENTRY.getKey(), isTimeEntryNotificationsEnabled);
		notificationsObjectNode.put(NotificationSettingsType.LEAVE_REQUEST_NUDGE.getKey(), isNudgeNotificationsEnabled);

		userSettings.setNotifications(notificationsObjectNode);
		userSettings.setUser(user);

		log.info("createNotificationSettings: execution ended");
		return userSettings;
	}

	private EpOrganizationResponseDto buildOrganizationResponse(EpOrganization organization, String companyDomain) {
		EpOrganizationResponseDto responseDto = epCommonMapper.epOrganizationToEpOrganizationResponseDto(organization);
		responseDto.setCompanyDomain(companyDomain + "." + parentDomain);
		responseDto.setUuid(generateUUID(companyDomain));
		responseDto.setTenantId(companyDomain);

		return responseDto;
	}

	private String generateUUID(String companyDomain) {
		String uuid = java.util.UUID.randomUUID().toString();
		CacheKey cacheKey = EpCacheKeys.CODE_CHALLENGE_CACHE_KEY;
		cacheService.put(cacheKey.format(companyDomain), uuid, cacheKey.getTtl(), cacheKey.getTimeUnit());
		return uuid;
	}

	private void cleanup(String companyDomain, boolean tenantCreated) {
		ModuleException cleanupException = null;

		if (tenantCreated) {
			try {
				tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
				tenantService.deleteTenant(companyDomain);
				log.info("Tenant deleted during cleanup: {}", companyDomain);
			}
			catch (Exception e) {
				String error = "Failed to delete tenant during cleanup: " + companyDomain;
				log.error(error, e);
				cleanupException = new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_DELETING_TENANT);
			}
		}

		if (cleanupException != null) {
			throw cleanupException;
		}
	}

	private void validateOrganizationInput(EpOrganizationDto organizationDto) {
		if (organizationDto.getOrganizationTimeZone() != null
				&& !isValidOrganizationTimeZone(organizationDto.getOrganizationTimeZone())) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_ORGANIZATION_TIMEZONE_FORMAT_INVALID);
		}

		if (organizationDto.getThemeColor() != null && !isValidThemeColor(organizationDto.getThemeColor())) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_ORGANIZATION_THEME_COLOR_FORMAT_INVALID);
		}

		if (organizationDto.getCompanyDomain() == null || organizationDto.getCompanyDomain().isEmpty()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_COMPANY_DOMAIN_REQUIRED);
		}

		if (organizationDto.getCompanyDomain().length() > EpCommonConstants.MAXIMUM_COMPANY_DOMAIN_NAME_LENGTH) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_COMPANY_DOMAIN_LENGTH_EXCEEDED);
		}

		if (!organizationDto.getCompanyDomain().matches(EpValidationConstants.VALID_COMPANY_DOMAIN_NAME_REGEXP)) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_COMPANY_DOMAIN_INVALID);
		}

		if (EpValidationConstants.RESTRICTED_SUBDOMAINS.contains(organizationDto.getCompanyDomain().toLowerCase())) {
			log.error("Attempted to create restricted subdomain: {}", organizationDto.getCompanyDomain());
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_RESTRICTED_SUBDOMAIN);
		}
	}

	private void setDefaultOrganizationConfigsForEp() {
		log.info("setDefaultOrganizationConfigs: execution started");

		attendanceConfigService.setDefaultAttendanceConfig();
		getDefaultTimeConfigs();
		leaveTypeService.createDefaultLeaveType();
		leaveCycleService.setLeaveCycleDefaultConfigs();
		esignConfigService.setDefaultEsignConfigs();

		log.info("setDefaultOrganizationConfigs: execution ended");
	}

}
