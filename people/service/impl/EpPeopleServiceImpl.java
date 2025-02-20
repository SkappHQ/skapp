package com.skapp.enterprise.people.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.BulkContextService;
import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.service.impl.AsyncEmailServiceImpl;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.payload.request.EmployeeBulkDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeBulkResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeEducationDao;
import com.skapp.community.peopleplanner.repository.EmployeeFamilyDao;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.repository.EmployeePeriodDao;
import com.skapp.community.peopleplanner.repository.EmployeeProgressionDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.repository.EmployeeTeamDao;
import com.skapp.community.peopleplanner.repository.EmployeeTimelineDao;
import com.skapp.community.peopleplanner.repository.EmployeeVisaDao;
import com.skapp.community.peopleplanner.repository.JobFamilyDao;
import com.skapp.community.peopleplanner.repository.JobTitleDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.service.EmployeeTimelineService;
import com.skapp.community.peopleplanner.service.PeopleEmailService;
import com.skapp.community.peopleplanner.service.RolesService;
import com.skapp.community.peopleplanner.service.impl.PeopleServiceImpl;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.config.TenantValidator;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.repository.EpEmployeeRoleRepository;
import com.skapp.enterprise.common.type.Tier;
import com.skapp.enterprise.people.constant.EpPeopleMessageConstant;
import com.skapp.enterprise.people.payload.response.EpEmployeeRoleLimitDto;
import com.skapp.enterprise.people.service.EpPeopleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Primary;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.List;
import java.util.Set;

@Slf4j
@Service
@Primary
public class EpPeopleServiceImpl extends PeopleServiceImpl implements EpPeopleService {

	private final EmployeeDao employeeDao;

	private final EmployeeRoleDao employeeRoleDao;

	private final TenantValidator tenantValidator;

	private final EpEmployeeRoleRepository epEmployeeRoleRepository;

	private final TenantDao tenantDao;

	private final TenantContext tenantContext;

	private final MessageUtil messageUtil;

	public EpPeopleServiceImpl(UserService userService, MessageUtil messageUtil, PeopleMapper peopleMapper,
			UserDao userDao, TeamDao teamDao, EmployeeDao employeeDao, JobFamilyDao jobFamilyDao,
			EmployeeProgressionDao employeeProgressionDao, JobTitleDao jobTitleDao, EmployeePeriodDao employeePeriodDao,
			EmployeeVisaDao employeeVisaDao, EmployeeEducationDao employeeEducationDao,
			EmployeeFamilyDao employeeFamilyDao, EmployeeTeamDao employeeTeamDao,
			EmployeeTimelineDao employeeTimelineDao, EmployeeManagerDao employeeManagerDao,
			EmployeeTimelineService employeeTimelineService, PasswordEncoder passwordEncoder, RolesService rolesService,
			PageTransformer pageTransformer, PlatformTransactionManager transactionManager,
			PeopleEmailService peopleEmailService, ObjectMapper mapper,
			EncryptionDecryptionService encryptionDecryptionService, BulkContextService bulkContextService,
			AsyncEmailServiceImpl asyncEmailServiceImpl, ApplicationEventPublisher applicationEventPublisher,
			EmployeeDao employeeDao1, EmployeeRoleDao employeeRoleDao, TenantValidator tenantValidator,
			EpEmployeeRoleRepository epEmployeeRoleRepository, TenantDao tenantDao, TenantContext tenantContext,
			MessageUtil messageUtil1) {
		super(userService, messageUtil, peopleMapper, userDao, teamDao, employeeDao, jobFamilyDao,
				employeeProgressionDao, jobTitleDao, employeePeriodDao, employeeVisaDao, employeeEducationDao,
				employeeFamilyDao, employeeTeamDao, employeeTimelineDao, employeeManagerDao, employeeTimelineService,
				passwordEncoder, rolesService, pageTransformer, transactionManager, peopleEmailService, mapper,
				encryptionDecryptionService, bulkContextService, asyncEmailServiceImpl, applicationEventPublisher);
		this.employeeDao = employeeDao1;
		this.employeeRoleDao = employeeRoleDao;
		this.tenantValidator = tenantValidator;
		this.epEmployeeRoleRepository = epEmployeeRoleRepository;
		this.tenantDao = tenantDao;
		this.tenantContext = tenantContext;
		this.messageUtil = messageUtil1;
	}

	@Override
	public ResponseEntityDto getEmployeesLimit() {
		boolean isLimitExceeded = checkEmployeesLimit();
		return new ResponseEntityDto(false, isLimitExceeded);
	}

	@Override
	public boolean checkEmployeesLimit() {
		if (tenantValidator.isCurrentTenantPro()) {
			return false;
		}

		return employeeDao
			.countByAccountStatus(AccountStatus.ACTIVE) >= EpCommonConstants.ENTERPRISE_FREE_MAX_EMPLOYEE_COUNT;
	}

	@Override
	public ResponseEntityDto getEmployeesCount() {
		long count = countActiveAndPendingEmployees();
		return new ResponseEntityDto(false, count);
	}

	private long countActiveAndPendingEmployees() {
		return employeeDao.countByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));
	}

	@Override
	public ResponseEntityDto getEmployeeRoleLimit() {
		EpEmployeeRoleLimitDto roleLimits = checkEmployeeRoleLimits();
		return new ResponseEntityDto(false, roleLimits);
	}

	@Override
	protected List<EmployeeBulkDto> getValidEmployeeBulkDtoList(List<EmployeeBulkDto> employeeBulkDtoList) {
		String tenantId = TenantContext.getCurrentTenant();
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		Tenant tenant = tenantDao.findByTenantName(tenantId);
		tenantContext.setTenantAndSwitchSchema(tenantId);

		if (tenant.getTier() == Tier.PRO) {
			long employeeCount = countActiveAndPendingEmployees();
			long maxAllowedCount = tenant.getSubscriptionQuantity() - employeeCount;

			if (maxAllowedCount < employeeBulkDtoList.size()) {
				return employeeBulkDtoList.subList(0, (int) Math.min(maxAllowedCount, employeeBulkDtoList.size()));
			}
		}

		return employeeBulkDtoList;
	}

	@Override
	protected List<EmployeeBulkResponseDto> getTotalResultList(List<EmployeeBulkResponseDto> results,
			List<EmployeeBulkDto> overflowedEmployeeBulkDtoList) {

		for (EmployeeBulkDto overflowedEmployee : overflowedEmployeeBulkDtoList) {
			EmployeeBulkResponseDto employeeBulkResponseDto = createErrorResponse(overflowedEmployee,
					messageUtil.getMessage(EpPeopleMessageConstant.EP_PEOPLE_ERROR_ALLOWED_USER_LIMIT_EXCEEDED));
			results.add(employeeBulkResponseDto);
		}

		return results;
	}

	private EpEmployeeRoleLimitDto checkEmployeeRoleLimits() {
		if (tenantValidator.isCurrentTenantPro()) {
			return new EpEmployeeRoleLimitDto(false, false, false, false, false, false, false, false, false);
		}

		return new EpEmployeeRoleLimitDto(checkLeaveAdminLimit(), checkAttendanceAdminLimit(), checkPeopleAdminLimit(),
				checkESignAdminLimit(), checkLeaveManagerLimit(), checkAttendanceManagerLimit(),
				checkPeopleManagerLimit(), checkSuperAdminLimit(), checkEsignSenderLimit());
	}

	private boolean checkLeaveAdminLimit() {
		return epEmployeeRoleRepository.countByEmployeeRoleIsSuperAdminAndAccountStatus(
				Role.LEAVE_ADMIN) >= EpCommonConstants.ENTERPRISE_FREE_MAX_LEAVE_ADMIN_COUNT;
	}

	private boolean checkAttendanceAdminLimit() {
		return epEmployeeRoleRepository.countByEmployeeRoleIsSuperAdminAndAccountStatus(
				Role.ATTENDANCE_ADMIN) >= EpCommonConstants.ENTERPRISE_FREE_MAX_ATTENDANCE_ADMIN_COUNT;
	}

	private boolean checkPeopleAdminLimit() {
		return epEmployeeRoleRepository.countByEmployeeRoleIsSuperAdminAndAccountStatus(
				Role.PEOPLE_ADMIN) >= EpCommonConstants.ENTERPRISE_FREE_MAX_PEOPLE_ADMIN_COUNT;
	}

	private boolean checkESignAdminLimit() {
		return employeeRoleDao.countByEsignRoleAndIsSuperAdmin(Role.ESIGN_ADMIN,
				false) >= EpCommonConstants.ENTERPRISE_FREE_MAX_ESIGN_ADMIN_COUNT;
	}

	private boolean checkLeaveManagerLimit() {
		return epEmployeeRoleRepository.countByEmployeeRoleIsSuperAdminAndAccountStatus(
				Role.LEAVE_MANAGER) >= EpCommonConstants.ENTERPRISE_FREE_MAX_LEAVE_MANAGER_COUNT;
	}

	private boolean checkAttendanceManagerLimit() {
		return epEmployeeRoleRepository.countByEmployeeRoleIsSuperAdminAndAccountStatus(
				Role.ATTENDANCE_MANAGER) >= EpCommonConstants.ENTERPRISE_FREE_MAX_ATTENDANCE_MANAGER_COUNT;
	}

	private boolean checkPeopleManagerLimit() {
		return epEmployeeRoleRepository.countByEmployeeRoleIsSuperAdminAndAccountStatus(
				Role.PEOPLE_MANAGER) >= EpCommonConstants.ENTERPRISE_FREE_MAX_PEOPLE_MANAGER_COUNT;
	}

	private boolean checkSuperAdminLimit() {
		return epEmployeeRoleRepository.countByEmployeeRoleIsSuperAdminAndAccountStatus(
				Role.SUPER_ADMIN) >= EpCommonConstants.ENTERPRISE_FREE_MAX_SUPER_ADMIN_COUNT;
	}

	private boolean checkEsignSenderLimit() {
		return employeeRoleDao.countByEsignRoleAndIsSuperAdmin(Role.ESIGN_SENDER,
				false) >= EpCommonConstants.ENTERPRISE_FREE_MAX_ESIGN_SENDER_COUNT;
	}

}
