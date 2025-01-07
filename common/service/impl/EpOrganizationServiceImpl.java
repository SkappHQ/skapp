package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.JwtService;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.leaveplanner.service.LeaveCycleService;
import com.skapp.community.leaveplanner.service.LeaveTypeService;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.community.timeplanner.service.AttendanceConfigService;
import com.skapp.community.timeplanner.service.TimeService;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.constant.EpValidationConstants;
import com.skapp.enterprise.common.mapper.EpCommonMapper;
import com.skapp.enterprise.common.masterrepository.SuperAdminDao;
import com.skapp.enterprise.common.model.EpOrganization;
import com.skapp.enterprise.common.model.master.SuperAdmin;
import com.skapp.enterprise.common.payload.request.EpOrganizationDto;
import com.skapp.enterprise.common.payload.response.EpOrganizationResponseDto;
import com.skapp.enterprise.common.repository.EpOrganizationDao;
import com.skapp.enterprise.common.service.EpCommonEmailService;
import com.skapp.enterprise.common.service.EpOrganizationService;
import com.skapp.enterprise.common.service.Route53Service;
import com.skapp.enterprise.common.service.TenantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import static com.skapp.community.common.util.Validation.isValidOrganizationTimeZone;
import static com.skapp.community.common.util.Validation.isValidThemeColor;

@Service
@Slf4j
@RequiredArgsConstructor
public class EpOrganizationServiceImpl implements EpOrganizationService {

	private final EpOrganizationDao epOrganizationDao;

	private final AttendanceConfigService attendanceConfigService;

	private final EpCommonEmailService emailService;

	private final TimeService timeService;

	private final LeaveTypeService leaveTypeService;

	private final LeaveCycleService leaveCycleService;

	private final TenantService tenantService;

	private final Route53Service route53Service;

	private final TenantContext tenantContext;

	private final EpCommonMapper epCommonMapper;

	private final SuperAdminDao superAdminDao;

	private final UserDao userDao;

	private final JwtService jwtService;

	@Value("${aws.route53.parent-domain}")
	private String parentDomain;

	@Override
	public ResponseEntityDto saveOrganization(EpOrganizationDto organizationDto) {
		validateOrganizationInput(organizationDto);
		String companyDomain = organizationDto.getCompanyDomain();
		boolean subdomainCreated = false;
		boolean tenantCreated = false;

		try {
			Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getCredentials();
			SuperAdmin superAdmin = superAdminDao.findById(userId)
				.orElseThrow(() -> new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUPER_ADMIN_NOR_FOUND));

			route53Service.createSubdomainForTenant(companyDomain);
			subdomainCreated = true;
			log.info("Subdomain created for: {}", companyDomain);

			tenantService.createTenant(companyDomain, superAdmin.getLoginMethod());
			tenantCreated = true;
			log.info("Tenant created for: {}", companyDomain);

			tenantContext.setTenantAndSwitchSchema(companyDomain);
			epOrganizationDao.save(epCommonMapper.epOrganizationDtoToEPOrganization(organizationDto));
			log.info("Organization saved for: {}", companyDomain);

			EpOrganization epOrganization = epOrganizationDao.findTopByOrderByOrganizationIdDesc();

			setDefaultOrganizationConfigs();

			User savedUser = createSuperAdminUser(superAdmin);
			log.info("Super admin user created for: {}", companyDomain);

			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
			superAdminDao.delete(superAdmin);
			log.info("SuperAdmin deleted after successful organization creation.");

			tenantContext.setTenantAndSwitchSchema(companyDomain);

			EpOrganizationResponseDto responseDto = buildOrganizationResponse(epOrganization, savedUser, companyDomain);
			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

			// Wait for subdomain to be active before sending email
			waitForSubdomainActive();

			emailService.sendTenantUrlEmail(superAdmin, companyDomain, organizationDto.getOrganizationName());

			return new ResponseEntityDto(false, responseDto);

		}
		catch (Exception e) {
			log.error("Error creating organization: {}", e.getMessage(), e);

			try {
				cleanup(companyDomain, subdomainCreated, tenantCreated);
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

	private void waitForSubdomainActive() {
		try {
			Thread.sleep(10000); // 10-second delay
		}
		catch (InterruptedException e) {
			Thread.currentThread().interrupt();
		}
	}

	@Override
	public ResponseEntityDto getTenantLoginType(String tenantName) {
		log.info("getTenantLoginType executed by: {}", tenantName);
		return tenantService.getTenant(tenantName);
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
		superAdminRoles.setIsSuperAdmin(true);
		superAdminRoles.setChangedDate(DateTimeUtils.getCurrentUtcDate());

		user.setEmployee(employee);
		employee.setUser(user);
		employee.setEmployeeRole(superAdminRoles);
		superAdminRoles.setEmployee(employee);
		superAdminRoles.setRoleChangedBy(employee);

		return userDao.save(user);
	}

	private EpOrganizationResponseDto buildOrganizationResponse(EpOrganization organization, User user,
			String companyDomain) {
		EpOrganizationResponseDto responseDto = epCommonMapper.epOrganizationToEpOrganizationResponseDto(organization);
		responseDto.setCompanyDomain(companyDomain + "." + parentDomain);

		String accessToken = jwtService.generateAccessToken(user, user.getUserId());
		String refreshToken = jwtService.generateRefreshToken(user);

		responseDto.setAccessToken(accessToken);
		responseDto.setRefreshToken(refreshToken);
		responseDto.setTenantId(companyDomain);

		return responseDto;
	}

	private void cleanup(String companyDomain, boolean subdomainCreated, boolean tenantCreated) {
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

		if (subdomainCreated) {
			try {
				route53Service.deleteTenantSubdomain(companyDomain);
				log.info("Subdomain deleted during cleanup: {}", companyDomain);
			}
			catch (Exception e) {
				String error = "Failed to delete subdomain during cleanup: " + companyDomain;
				log.error(error, e);
				cleanupException = new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_DELETING_SUBDOMAIN);
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

		if (route53Service.isDomainNotAvailable(organizationDto.getCompanyDomain())) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_COMPANY_DOMAIN_NOT_AVAILABLE);
		}
	}

	private void setDefaultOrganizationConfigs() {
		log.info("setDefaultOrganizationConfigs: execution started");

		attendanceConfigService.setDefaultAttendanceConfig();
		timeService.getDefaultTimeConfigs();
		leaveTypeService.createDefaultLeaveType();
		leaveCycleService.setLeaveCycleDefaultConfigs();

		log.info("setDefaultOrganizationConfigs: execution ended");
	}

}
