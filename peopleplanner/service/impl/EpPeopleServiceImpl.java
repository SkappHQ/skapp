package com.skapp.enterprise.peopleplanner.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.BulkContextService;
import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.service.UserVersionService;
import com.skapp.community.common.service.impl.AsyncEmailServiceImpl;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeePeriod;
import com.skapp.community.peopleplanner.model.EmployeeProgression;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.payload.CurrentEmployeeDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeBulkDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeDetailsDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeUpdateDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeBulkResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeEducationDao;
import com.skapp.community.peopleplanner.repository.EmployeeFamilyDao;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.repository.EmployeePeriodDao;
import com.skapp.community.peopleplanner.repository.EmployeeProgressionDao;
import com.skapp.community.peopleplanner.repository.EmployeeRoleDao;
import com.skapp.community.peopleplanner.repository.EmployeeTeamDao;
import com.skapp.community.peopleplanner.repository.EmployeeVisaDao;
import com.skapp.community.peopleplanner.repository.JobFamilyDao;
import com.skapp.community.peopleplanner.repository.JobTitleDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
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
import com.skapp.enterprise.peopleplanner.constant.EpPeopleMessageConstant;
import com.skapp.enterprise.peopleplanner.payload.response.EpEmployeeRoleLimitDto;
import com.skapp.enterprise.peopleplanner.service.EpEmployeeTimelineService;
import com.skapp.enterprise.peopleplanner.service.EpPeopleService;
import jakarta.persistence.EntityManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Primary;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

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

	private final EpEmployeeTimelineService epEmployeeTimelineService;

	private final EmployeePeriodDao employeePeriodDao;

	public EpPeopleServiceImpl(UserService userService, MessageUtil messageUtil, PeopleMapper peopleMapper,
			TeamDao teamDao, EmployeeDao employeeDao, JobFamilyDao jobFamilyDao,
			EmployeeProgressionDao employeeProgressionDao, JobTitleDao jobTitleDao, EmployeePeriodDao employeePeriodDao,
			EmployeeVisaDao employeeVisaDao, EmployeeEducationDao employeeEducationDao,
			EmployeeFamilyDao employeeFamilyDao, EmployeeTeamDao employeeTeamDao, EmployeeManagerDao employeeManagerDao,
			PasswordEncoder passwordEncoder, RolesService rolesService, PageTransformer pageTransformer,
			PlatformTransactionManager transactionManager, PeopleEmailService peopleEmailService, ObjectMapper mapper,
			EncryptionDecryptionService encryptionDecryptionService, BulkContextService bulkContextService,
			AsyncEmailServiceImpl asyncEmailServiceImpl, ApplicationEventPublisher applicationEventPublisher,
			EmployeeRoleDao employeeRoleDao, TenantValidator tenantValidator,
			EpEmployeeRoleRepository epEmployeeRoleRepository, TenantDao tenantDao, TenantContext tenantContext,
			UserVersionService userVersionService, EpEmployeeTimelineService epEmployeeTimelineService, UserDao userDao,
			EntityManager entityManager) {
		super(userService, messageUtil, peopleMapper, userDao, teamDao, employeeDao, jobFamilyDao,
				employeeProgressionDao, jobTitleDao, employeePeriodDao, employeeVisaDao, employeeEducationDao,
				employeeFamilyDao, employeeTeamDao, employeeManagerDao, passwordEncoder, rolesService, pageTransformer,
				transactionManager, peopleEmailService, mapper, encryptionDecryptionService, bulkContextService,
				asyncEmailServiceImpl, applicationEventPublisher, userVersionService, entityManager);
		this.employeeDao = employeeDao;
		this.employeeRoleDao = employeeRoleDao;
		this.tenantValidator = tenantValidator;
		this.epEmployeeRoleRepository = epEmployeeRoleRepository;
		this.tenantDao = tenantDao;
		this.tenantContext = tenantContext;
		this.messageUtil = messageUtil;
		this.epEmployeeTimelineService = epEmployeeTimelineService;
		this.employeePeriodDao = employeePeriodDao;
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

		Tenant currentTenant = getCurrentTenantDetails();

		if (currentTenant.getTier() == Tier.PRO) {
			long employeeCount = countActiveAndPendingEmployees();
			long maxAllowedCount = currentTenant.getSubscriptionQuantity() - employeeCount;

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

	@Override
	public void addNewEmployeeTimeLineRecords(Employee savedEmployee, EmployeeDetailsDto employeeDetailsDto) {
		Tenant currentTenant = getCurrentTenantDetails();
		if (currentTenant.getTier() == Tier.PRO) {
			epEmployeeTimelineService.addNewEmployeeTimeLineRecords(savedEmployee, employeeDetailsDto);
		}
	}

	@Override
	public void addUpdatedEmployeeTimeLineRecords(CurrentEmployeeDto currentEmployee,
			EmployeeUpdateDto employeeUpdateDto) {
		Tenant currentTenant = getCurrentTenantDetails();
		if (currentTenant.getTier() == Tier.PRO) {
			epEmployeeTimelineService.addUpdatedEmployeeTimeLineRecords(currentEmployee, employeeUpdateDto);
		}
	}

	@Override
	protected CurrentEmployeeDto getEmployeeDeepCopy(Employee currentEmployee) {
		CurrentEmployeeDto deepCopiedDto = new CurrentEmployeeDto();

		deepCopiedDto.setEmployeeId(currentEmployee.getEmployeeId());
		deepCopiedDto.setJoinDate(currentEmployee.getJoinDate());

		if (currentEmployee.getEmployeeProgressions() != null) {
			List<EmployeeProgression> copiedProgressions = currentEmployee.getEmployeeProgressions()
				.stream()
				.map(EmployeeProgression::new)
				.toList();
			deepCopiedDto.setEmployeeProgressions(copiedProgressions);
		}

		if (currentEmployee.getTeams() != null) {
			Set<EmployeeTeam> copiedTeams = currentEmployee.getTeams()
				.stream()
				.map(EmployeeTeam::new)
				.collect(Collectors.toSet());
			deepCopiedDto.setTeams(copiedTeams);
		}

		if (currentEmployee.getEmployees() != null) {
			Set<EmployeeManager> copiedManagers = currentEmployee.getEmployees()
				.stream()
				.map(EmployeeManager::new)
				.collect(Collectors.toSet());
			deepCopiedDto.setManagers(copiedManagers);
		}

		if (currentEmployee.getEmploymentAllocation() != null) {
			deepCopiedDto.setEmploymentAllocation(currentEmployee.getEmploymentAllocation());
		}

		if (currentEmployee.getEmployeeRole() != null) {
			deepCopiedDto.setEmployeeRole(currentEmployee.getEmployeeRole());
		}

		Optional<EmployeePeriod> employeePeriod = employeePeriodDao
			.findEmployeePeriodByEmployee_EmployeeId(currentEmployee.getEmployeeId());
		employeePeriod.ifPresent(period -> deepCopiedDto.setEmployeePeriod(new EmployeePeriod(period)));

		return deepCopiedDto;
	}

	private Tenant getCurrentTenantDetails() {
		String tenantId = TenantContext.getCurrentTenant();
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		Tenant tenant = tenantDao.findByTenantName(tenantId);
		tenantContext.setTenantAndSwitchSchema(tenantId);
		return tenant;
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
