package com.skapp.enterprise.people.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.BulkContextService;
import com.skapp.community.common.service.CacheService;
import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.service.SystemVersionService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.service.UserVersionService;
import com.skapp.community.common.service.impl.AsyncEmailServiceImpl;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.type.SystemVersionTypes;
import com.skapp.community.common.type.VersionType;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.event.UsersDeactivatedEvent;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.leaveplanner.type.ManagerType;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeePeriod;
import com.skapp.community.peopleplanner.model.EmployeeProgression;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.CurrentEmployeeDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeBulkDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeQuickAddDto;
import com.skapp.community.peopleplanner.payload.request.employee.CreateEmployeeRequestDto;
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
import com.skapp.community.peopleplanner.service.EmployeeValidationService;
import com.skapp.community.peopleplanner.service.PeopleEmailService;
import com.skapp.community.peopleplanner.service.RolesService;
import com.skapp.community.peopleplanner.service.impl.PeopleServiceImpl;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.EmployeePeriodSort;
import com.skapp.enterprise.common.config.SpecialTenantConfig;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.config.TenantValidator;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.EpOrganization;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.repository.EpOrganizationDao;
import com.skapp.enterprise.common.service.StripeService;
import com.skapp.enterprise.common.service.ValidationService;
import com.skapp.enterprise.common.type.Country;
import com.skapp.enterprise.common.type.EpCacheKeys;
import com.skapp.enterprise.common.type.LanguageCode;
import com.skapp.enterprise.common.type.TenantStatus;
import com.skapp.enterprise.common.type.Tier;
import com.skapp.enterprise.esignature.service.EnvelopeService;
import com.skapp.enterprise.people.constant.EpPeopleMessageConstant;
import com.skapp.enterprise.people.mapper.EpPeopleMapper;
import com.skapp.enterprise.people.payload.request.DeactivateUsersRequestDto;
import com.skapp.enterprise.people.payload.request.TransferManagersAndSupervisorsRequestDto;
import com.skapp.enterprise.people.payload.request.TransferManagersRequestDto;
import com.skapp.enterprise.people.payload.request.TransferSupervisorsRequestDto;
import com.skapp.enterprise.people.payload.request.UpdateUserLanguageRequestDto;
import com.skapp.enterprise.people.payload.response.EmployeeDetailsResponseDto;
import com.skapp.enterprise.people.payload.response.EmployeeManagerDetailsResponseDto;
import com.skapp.enterprise.people.payload.response.EmployeeTeamDetailsResponseDto;
import com.skapp.enterprise.people.payload.response.EpEmployeeRoleLimitDto;
import com.skapp.enterprise.people.repository.EpEmployeeDao;
import com.skapp.enterprise.people.repository.EpEmployeeManagerDao;
import com.skapp.enterprise.people.repository.EpEmployeeRoleDao;
import com.skapp.enterprise.people.repository.EpEmployeeTeamDao;
import com.skapp.enterprise.people.service.EpEmployeeTimelineService;
import com.skapp.enterprise.people.service.EpPeopleService;
import com.skapp.enterprise.people.service.EpRolesService;
import com.skapp.enterprise.people.service.EpUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@Primary
public class EpPeopleServiceImpl extends PeopleServiceImpl implements EpPeopleService {

	private final EmployeeDao employeeDao;

	private final EpEmployeeDao epEmployeeDao;

	private final EmployeeRoleDao employeeRoleDao;

	private final TenantValidator tenantValidator;

	private final EpEmployeeRoleDao epEmployeeRoleDao;

	private final MessageUtil messageUtil;

	private final EpEmployeeTimelineService epEmployeeTimelineService;

	private final EmployeePeriodDao employeePeriodDao;

	private final EpPeopleMapper epPeopleMapper;

	private final UserDao userDao;

	private final EpEmployeeTeamDao epEmployeeTeamDao;

	private final EpEmployeeManagerDao epEmployeeManagerDao;

	private final EpUserService epUserService;

	private final SystemVersionService systemVersionService;

	private final StripeService stripeService;

	private final TenantContext tenantContext;

	private final TenantDao tenantDao;

	private final EpRolesService epRolesService;

	private final EpAsyncEmployeeTimelineServiceImpl epAsyncEmployeeTimelineServiceImpl;

	private final SpecialTenantConfig specialTenantConfig;

	private final ValidationService validationService;

	private final EnvelopeService envelopeService;

	private final CacheService cacheService;

	private final EpOrganizationDao epOrganizationDao;

	public EpPeopleServiceImpl(UserService userService, MessageUtil messageUtil, PeopleMapper peopleMapper,
			UserDao userDao, TeamDao teamDao, EmployeeDao employeeDao, JobFamilyDao jobFamilyDao,
			JobTitleDao jobTitleDao, EmployeePeriodDao employeePeriodDao, EmployeeTeamDao employeeTeamDao,
			EmployeeManagerDao employeeManagerDao, PasswordEncoder passwordEncoder, RolesService rolesService,
			PageTransformer pageTransformer, PlatformTransactionManager transactionManager,
			PeopleEmailService peopleEmailService, ObjectMapper mapper,
			EncryptionDecryptionService encryptionDecryptionService, BulkContextService bulkContextService,
			AsyncEmailServiceImpl asyncEmailServiceImpl, ApplicationEventPublisher applicationEventPublisher,
			UserVersionService userVersionService, EmployeeValidationService employeeValidationService,
			EmployeeFamilyDao employeeFamilyDao, EmployeeEducationDao employeeEducationDao,
			EmployeeProgressionDao employeeProgressionDao, EmployeeVisaDao employeeVisaDao, EpEmployeeDao epEmployeeDao,
			EmployeeRoleDao employeeRoleDao, TenantValidator tenantValidator, EpEmployeeRoleDao epEmployeeRoleDao,
			EpEmployeeTimelineService epEmployeeTimelineService, EpPeopleMapper epPeopleMapper,
			EpEmployeeTeamDao epEmployeeTeamDao, EpEmployeeManagerDao epEmployeeManagerDao, EpUserService epUserService,
			SystemVersionService systemVersionService, StripeService stripeService, TenantContext tenantContext,
			TenantDao tenantDao, EpRolesService epRolesService,
			EpAsyncEmployeeTimelineServiceImpl epAsyncEmployeeTimelineServiceImpl,
			SpecialTenantConfig specialTenantConfig, ValidationService validationService,
			EnvelopeService envelopeService, CacheService cacheService, EpOrganizationDao epOrganizationDao) {
		super(userService, messageUtil, peopleMapper, userDao, teamDao, employeeDao, jobFamilyDao, jobTitleDao,
				employeePeriodDao, employeeTeamDao, employeeManagerDao, passwordEncoder, rolesService, pageTransformer,
				transactionManager, peopleEmailService, mapper, encryptionDecryptionService, bulkContextService,
				asyncEmailServiceImpl, applicationEventPublisher, userVersionService, employeeValidationService,
				employeeFamilyDao, employeeEducationDao, employeeProgressionDao, employeeVisaDao);
		this.employeeDao = employeeDao;
		this.epEmployeeDao = epEmployeeDao;
		this.employeeRoleDao = employeeRoleDao;
		this.tenantValidator = tenantValidator;
		this.epEmployeeRoleDao = epEmployeeRoleDao;
		this.messageUtil = messageUtil;
		this.epEmployeeTimelineService = epEmployeeTimelineService;
		this.employeePeriodDao = employeePeriodDao;
		this.epPeopleMapper = epPeopleMapper;
		this.userDao = userDao;
		this.epEmployeeTeamDao = epEmployeeTeamDao;
		this.epEmployeeManagerDao = epEmployeeManagerDao;
		this.epUserService = epUserService;
		this.systemVersionService = systemVersionService;
		this.stripeService = stripeService;
		this.tenantContext = tenantContext;
		this.tenantDao = tenantDao;
		this.epRolesService = epRolesService;
		this.epAsyncEmployeeTimelineServiceImpl = epAsyncEmployeeTimelineServiceImpl;
		this.specialTenantConfig = specialTenantConfig;
		this.validationService = validationService;
		this.envelopeService = envelopeService;
		this.cacheService = cacheService;
		this.epOrganizationDao = epOrganizationDao;
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

		int maxEmployeeCount = specialTenantConfig.getMaxEmployeeCountForTenant();

		return employeeDao
			.countByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING)) >= maxEmployeeCount;
	}

	@Override
	public ResponseEntityDto getEmployeesCount() {
		long count = countActiveAndPendingEmployees();
		return new ResponseEntityDto(false, count);
	}

	@Override
	public ResponseEntityDto getManagersAndSupervisorsFromEmployeeIds(List<Long> employeeIds) {
		List<Employee> employees = epEmployeeDao.findAllByEmployeeIdInAndAccountStatusIn(employeeIds,
				Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));

		List<EmployeeTeamDetailsResponseDto> teamSupervisors = getTeamSupervisors(employees);
		List<EmployeeManagerDetailsResponseDto> primaryManagers = getPrimaryManagersWithSupervisedEmployees(employees);

		return new ResponseEntityDto(false, new EmployeeDetailsResponseDto(teamSupervisors, primaryManagers));
	}

	@Override
	public ResponseEntityDto transferSupervisorsAndManagers(TransferManagersAndSupervisorsRequestDto transferRequest) {
		if (transferRequest.getSupervisors() != null && !transferRequest.getSupervisors().isEmpty()) {
			transferTeamSupervisors(transferRequest.getSupervisors());
		}

		if (transferRequest.getManagers() != null && !transferRequest.getManagers().isEmpty()) {
			transferPrimaryManagers(transferRequest.getManagers());
		}

		return new ResponseEntityDto(false,
				messageUtil.getMessage(EpPeopleMessageConstant.EP_PEOPLE_SUCCESS_MANAGERS_AND_SUPERVISORS_TRANSFER));
	}

	@Override
	public ResponseEntityDto getManagerRoleEmployeesExcludingEmployeeIds(List<Long> employeeIds) {
		List<Employee> employees = epEmployeeDao.getManagerRoleEmployeesExcludingEmployeeIds(employeeIds);

		return new ResponseEntityDto(false, epPeopleMapper.employeesToEmployeeBasicDetailsResponseDtos(employees));
	}

	@Override
	public ResponseEntityDto deactivateUsers(DeactivateUsersRequestDto deactivateUsersRequestDto) {
		if (deactivateUsersRequestDto.getEmployeeIds() == null
				|| deactivateUsersRequestDto.getEmployeeIds().isEmpty()) {
			return new ResponseEntityDto(true,
					messageUtil.getMessage(EpPeopleMessageConstant.EP_PEOPLE_ERROR_NO_EMPLOYEES_TO_DEACTIVATE));
		}

		List<Employee> employees = epEmployeeDao.findAllByEmployeeIdInAndAccountStatusIn(
				deactivateUsersRequestDto.getEmployeeIds(), Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));

		if (employees.isEmpty()) {
			return new ResponseEntityDto(true,
					messageUtil.getMessage(EpPeopleMessageConstant.EP_PEOPLE_ERROR_EMPLOYEES_NOT_FOUND));
		}

		deactivateEmployees(employees);
		envelopeService.transferEmployeeEnvelopes(employees);
		epRolesService.downgradeUserRolesToEmployeeRole();

		List<User> users = employees.stream().map(Employee::getUser).toList();
		applicationEventPublisher.publishEvent(new UsersDeactivatedEvent(this, users));

		long userCount = employeeDao.countByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));
		String currentTenant = TenantContext.getCurrentTenant();
		int maxCount = specialTenantConfig.getMaxEmployeeCountForTenant();

		if (userCount <= maxCount) {
			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
			Tenant tenant = tenantDao.findByTenantName(currentTenant);
			tenant.setTier(Tier.FREE);
			tenant.setTenantStatus(TenantStatus.ACTIVE);
			tenantDao.save(tenant);
			tenantContext.setTenantAndSwitchSchema(currentTenant);

			systemVersionService.upgradeSystemVersion(VersionType.MAJOR,
					SystemVersionTypes.TIER_CHANGE_FROM_PRO_TO_FREE_AND_SET_TENANT_STATUS_ACTIVE);
		}

		return new ResponseEntityDto(false,
				messageUtil.getMessage(EpPeopleMessageConstant.EP_PEOPLE_SUCCESS_EMPLOYEES_DEACTIVATED));
	}

	@Override
	public ResponseEntityDto updateUserLanguage(UpdateUserLanguageRequestDto requestDto) {
		User currentUser = userService.getCurrentUser();
		currentUser.setLang(requestDto.getLang());
		userDao.save(currentUser);

		userVersionService.upgradeUserVersion(currentUser.getUserId(), VersionType.MAJOR);

		return new ResponseEntityDto(false, epPeopleMapper.userToEpUserResponseWithLangDto(currentUser));
	}

	@Override
	public ResponseEntityDto getCurrentUserLanguage() {
		EpOrganization organization = epOrganizationDao.findTopByOrderByOrganizationIdDesc();
		User currentUser = userService.getCurrentUser();

		String lang = Optional.ofNullable(currentUser.getLang())
			.orElseGet(() -> Country.SWEDEN.getCountry().equalsIgnoreCase(organization.getCountry())
					? LanguageCode.SWEDISH.getCode() : LanguageCode.ENGLISH.getCode());

		return new ResponseEntityDto(false, lang);
	}

	@Override
	protected void enterpriseValidations(String email) {
		validationService.checkBusinessEmailValidity(email);
	}

	private void deactivateEmployees(List<Employee> employees) {
		for (Employee employee : employees) {
			employee.setAccountStatus(AccountStatus.DEACTIVATED);
			epEmployeeDao.save(employee);

			if (employee.getUser() != null) {
				employee.getUser().setIsActive(false);
				userDao.save(employee.getUser());
			}
		}
	}

	@Override
	protected void invalidateUserCache() {
		EpCacheKeys userCacheKey = EpCacheKeys.TENANT_ALL_USERS_CACHE_KEY;
		cacheService.invalidate(userCacheKey.getKey());
	}

	@Override
	protected void invalidateUserAuthPicCache() {
		EpCacheKeys userAuthPicCacheKey = EpCacheKeys.TENANT_ALL_USERS_CACHE_KEY;
		cacheService.invalidate(userAuthPicCacheKey.getKey());
	}

	private void transferTeamSupervisors(List<TransferSupervisorsRequestDto> supervisorsTransfer) {
		for (TransferSupervisorsRequestDto transfer : supervisorsTransfer) {
			Long currentSupervisorId = transfer.getSupervisorId();
			Long newSupervisorId = transfer.getTransferredSupervisorId();

			Employee currentSupervisor = epEmployeeDao.findById(currentSupervisorId)
				.orElseThrow(() -> new ModuleException(EpPeopleMessageConstant.EP_PEOPLE_ERROR_SUPERVISOR_NOT_FOUND));

			List<EmployeeTeam> supervisorTeams = epEmployeeTeamDao.findByEmployeeAndIsSupervisorTrue(currentSupervisor);

			Employee newSupervisor = epEmployeeDao.findById(newSupervisorId)
				.orElseThrow(() -> new ModuleException(EpPeopleMessageConstant.EP_PEOPLE_ERROR_SUPERVISOR_NOT_FOUND));

			for (EmployeeTeam supervisorTeam : supervisorTeams) {
				Team team = supervisorTeam.getTeam();
				supervisorTeam.setIsSupervisor(false);

				EmployeeTeam newSupervisorTeam = epEmployeeTeamDao.findByEmployeeAndTeam(newSupervisor, team)
					.orElseGet(() -> {
						EmployeeTeam newMembership = new EmployeeTeam();
						newMembership.setEmployee(newSupervisor);
						newMembership.setTeam(team);
						return newMembership;
					});

				newSupervisorTeam.setIsSupervisor(true);

				epEmployeeTeamDao.saveAll(List.of(supervisorTeam, newSupervisorTeam));
			}
		}

	}

	private void transferPrimaryManagers(List<TransferManagersRequestDto> managersTransfer) {
		for (TransferManagersRequestDto transfer : managersTransfer) {
			Long currentManagerId = transfer.getManagerId();
			Long newManagerId = transfer.getTransferredManagerId();

			Employee currentManager = epEmployeeDao.findById(currentManagerId)
				.orElseThrow(() -> new ModuleException(EpPeopleMessageConstant.EP_PEOPLE_ERROR_MANAGER_NOT_FOUND));

			List<EmployeeManager> managedEmployees = epEmployeeManagerDao.findByManagerAndManagerType(currentManager,
					ManagerType.PRIMARY);

			Employee newManager = epEmployeeDao.findById(newManagerId)
				.orElseThrow(() -> new ModuleException(EpPeopleMessageConstant.EP_PEOPLE_ERROR_MANAGER_NOT_FOUND));

			managedEmployees.forEach(employeeManager -> employeeManager.setManager(newManager));
			epEmployeeManagerDao.saveAll(managedEmployees);
		}

	}

	private List<EmployeeTeamDetailsResponseDto> getTeamSupervisors(List<Employee> employees) {
		List<EmployeeTeam> employeeTeams = epEmployeeTeamDao.findByEmployeeInAndIsSupervisorTrue(employees);

		Map<Long, Employee> supervisorIdMap = new HashMap<>();
		Map<Long, List<Team>> supervisorToTeams = new HashMap<>();

		for (EmployeeTeam employeeTeam : employeeTeams) {
			Employee supervisor = employeeTeam.getEmployee();
			Team team = employeeTeam.getTeam();
			Long supervisorId = supervisor.getEmployeeId();

			supervisorIdMap.putIfAbsent(supervisorId, supervisor);
			supervisorToTeams.computeIfAbsent(supervisorId, id -> new ArrayList<>()).add(team);
		}

		return supervisorIdMap.entrySet().stream().map(entry -> {
			Long supervisorId = entry.getKey();
			Employee supervisor = entry.getValue();

			EmployeeTeamDetailsResponseDto dto = epPeopleMapper.employeeToEmployeeTeamDetailsResponseDto(supervisor);

			List<Team> supervisedTeams = supervisorToTeams.get(supervisorId);
			dto.setTeams(supervisedTeams.stream().map(epPeopleMapper::teamToTeamBasicDetailsResponseDto).toList());

			return dto;
		}).toList();
	}

	private List<EmployeeManagerDetailsResponseDto> getPrimaryManagersWithSupervisedEmployees(
			List<Employee> employees) {
		List<EmployeeManager> primaryEmployeeManagers = epEmployeeManagerDao.findByManagerInAndManagerType(employees,
				ManagerType.PRIMARY);

		Map<Long, Employee> managerIdMap = new HashMap<>();
		Map<Long, List<Employee>> managerToEmployees = new HashMap<>();

		for (EmployeeManager employeeManager : primaryEmployeeManagers) {
			Employee manager = employeeManager.getManager();
			Employee employee = employeeManager.getEmployee();
			Long managerId = manager.getEmployeeId();

			managerIdMap.putIfAbsent(managerId, manager);
			managerToEmployees.computeIfAbsent(managerId, id -> new ArrayList<>()).add(employee);
		}

		return managerIdMap.entrySet().stream().map(entry -> {
			Long managerId = entry.getKey();
			Employee manager = entry.getValue();

			EmployeeManagerDetailsResponseDto dto = epPeopleMapper
				.employeeToEmployeeSupervisorDetailsResponseDto(manager);

			List<Employee> supervisedEmployees = managerToEmployees.get(managerId);
			dto.setSupervisedEmployees(supervisedEmployees.stream()
				.map(epPeopleMapper::employeeToEmployeeBasicDetailsResponseDto)
				.sorted(Comparator.comparing(EmployeeBasicDetailsResponseDto::getEmployeeId))
				.toList());

			return dto;
		}).toList();
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

		Tier currentUserTier = epUserService.getCurrentUserTier();
		if (currentUserTier == Tier.FREE) {
			long employeeCount = countActiveAndPendingEmployees();
			long maxAllowedCount = EpCommonConstants.ENTERPRISE_FREE_MAX_EMPLOYEE_COUNT - employeeCount;

			if (maxAllowedCount <= 0) {
				throw new ModuleException(EpPeopleMessageConstant.EP_PEOPLE_ERROR_ALLOWED_USER_LIMIT_EXCEEDED);
			}

			if (maxAllowedCount < employeeBulkDtoList.size()) {
				return employeeBulkDtoList.subList(0, (int) Math.min(maxAllowedCount, employeeBulkDtoList.size()));
			}
		}

		return employeeBulkDtoList;
	}

	@Override
	protected boolean checkUserCountExceeded() {
		return checkEmployeesLimit();
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
	protected void addNewEmployeeTimeLineRecords(Employee savedEmployee, CreateEmployeeRequestDto employeeDetailsDto) {
		epEmployeeTimelineService.addNewEmployeeTimeLineRecords(savedEmployee, employeeDetailsDto);
	}

	@Override
	protected void addNewQuickUploadedEmployeeTimeLineRecords(Employee savedEmployee,
			EmployeeQuickAddDto employeeQuickAddDto) {
		epEmployeeTimelineService.addNewQuickUploadedEmployeeTimeLineRecords(savedEmployee, employeeQuickAddDto);
	}

	@Override
	protected void addNewBulkUploadedEmployeeTimeLineRecords(List<EmployeeBulkResponseDto> results) {
		epAsyncEmployeeTimelineServiceImpl.addNewBulkUploadedEmployeeTimeLineRecordsInBackground(results);
	}

	@Override
	protected void addUpdatedEmployeeTimeLineRecords(CurrentEmployeeDto currentEmployee,
			CreateEmployeeRequestDto createEmployeeRequestDto) {
		epEmployeeTimelineService.addUpdatedEmployeeTimeLineRecords(currentEmployee, createEmployeeRequestDto);
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

		if (currentEmployee.getEmployeeTeams() != null) {
			Set<EmployeeTeam> copiedTeams = currentEmployee.getEmployeeTeams()
				.stream()
				.map(EmployeeTeam::new)
				.collect(Collectors.toSet());
			deepCopiedDto.setTeams(copiedTeams);
		}

		if (currentEmployee.getEmployeeManagers() != null) {
			Set<EmployeeManager> copiedManagers = currentEmployee.getEmployeeManagers()
				.stream()
				.map(EmployeeManager::new)
				.collect(Collectors.toSet());
			deepCopiedDto.setManagers(copiedManagers);
		}

		if (currentEmployee.getEmploymentAllocation() != null) {
			deepCopiedDto.setEmploymentAllocation(currentEmployee.getEmploymentAllocation());
		}

		if (currentEmployee.getEmployeeRole() != null) {
			deepCopiedDto.setEmployeeRole(new EmployeeRole(currentEmployee.getEmployeeRole()));
		}

		List<EmployeePeriod> employeePeriod = employeePeriodDao.findEmployeePeriodByEmployee_EmployeeId(
				currentEmployee.getEmployeeId(), Sort.by(Sort.Direction.DESC, EmployeePeriodSort.ID.getSortField()));

		if (!employeePeriod.isEmpty()) {
			deepCopiedDto.setEmployeePeriod(new EmployeePeriod(employeePeriod.getFirst()));
		}

		return deepCopiedDto;
	}

	@Override
	protected void updateSubscriptionQuantity(long quantity, boolean isIncrement, boolean isFromEmployeeBulk) {
		Tier tier = epUserService.getCurrentUserTier();
		TenantStatus tenantStatus = epUserService.getCurrentUserTenantStatus();
		if (tier == Tier.PRO && tenantStatus == TenantStatus.ACTIVE) {
			stripeService.updateSubscriptionQuantity(quantity, isIncrement, isFromEmployeeBulk);
		}
	}

	private EpEmployeeRoleLimitDto checkEmployeeRoleLimits() {
		if (tenantValidator.isCurrentTenantPro()) {
			return new EpEmployeeRoleLimitDto(false, false, false, false, false, false, false, false, false);
		}

		SpecialTenantConfig.TenantInfo tenantInfo = specialTenantConfig.getCurrentTenantInfo();

		return new EpEmployeeRoleLimitDto(checkLeaveAdminLimit(tenantInfo), checkAttendanceAdminLimit(tenantInfo),
				checkPeopleAdminLimit(tenantInfo), checkESignAdminLimit(tenantInfo), checkLeaveManagerLimit(tenantInfo),
				checkAttendanceManagerLimit(tenantInfo), checkPeopleManagerLimit(tenantInfo),
				checkSuperAdminLimit(tenantInfo), checkEsignSenderLimit(tenantInfo));
	}

	private boolean checkLeaveAdminLimit(SpecialTenantConfig.TenantInfo tenantInfo) {
		int maxCount = tenantInfo != null && tenantInfo.getUserCount() != null ? tenantInfo.getUserCount()
				: EpCommonConstants.ENTERPRISE_FREE_MAX_LEAVE_ADMIN_COUNT;
		return epEmployeeRoleDao.countByEmployeeRoleIsSuperAdminAndAccountStatus(Role.LEAVE_ADMIN) >= maxCount;
	}

	private boolean checkAttendanceAdminLimit(SpecialTenantConfig.TenantInfo tenantInfo) {
		int maxCount = tenantInfo != null && tenantInfo.getUserCount() != null ? tenantInfo.getUserCount()
				: EpCommonConstants.ENTERPRISE_FREE_MAX_ATTENDANCE_ADMIN_COUNT;
		return epEmployeeRoleDao.countByEmployeeRoleIsSuperAdminAndAccountStatus(Role.ATTENDANCE_ADMIN) >= maxCount;
	}

	private boolean checkPeopleAdminLimit(SpecialTenantConfig.TenantInfo tenantInfo) {
		int maxCount = tenantInfo != null && tenantInfo.getUserCount() != null ? tenantInfo.getUserCount()
				: EpCommonConstants.ENTERPRISE_FREE_MAX_PEOPLE_ADMIN_COUNT;
		return epEmployeeRoleDao.countByEmployeeRoleIsSuperAdminAndAccountStatus(Role.PEOPLE_ADMIN) >= maxCount;
	}

	private boolean checkESignAdminLimit(SpecialTenantConfig.TenantInfo tenantInfo) {
		int maxCount = tenantInfo != null && tenantInfo.getUserCount() != null ? tenantInfo.getUserCount()
				: EpCommonConstants.ENTERPRISE_FREE_MAX_ESIGN_ADMIN_COUNT;
		return employeeRoleDao.countByEsignRoleAndIsSuperAdmin(Role.ESIGN_ADMIN, false) >= maxCount;
	}

	private boolean checkLeaveManagerLimit(SpecialTenantConfig.TenantInfo tenantInfo) {
		int maxCount = tenantInfo != null && tenantInfo.getUserCount() != null ? tenantInfo.getUserCount()
				: EpCommonConstants.ENTERPRISE_FREE_MAX_LEAVE_MANAGER_COUNT;
		return epEmployeeRoleDao.countByEmployeeRoleIsSuperAdminAndAccountStatus(Role.LEAVE_MANAGER) >= maxCount;
	}

	private boolean checkAttendanceManagerLimit(SpecialTenantConfig.TenantInfo tenantInfo) {
		int maxCount = tenantInfo != null && tenantInfo.getUserCount() != null ? tenantInfo.getUserCount()
				: EpCommonConstants.ENTERPRISE_FREE_MAX_ATTENDANCE_MANAGER_COUNT;
		return epEmployeeRoleDao.countByEmployeeRoleIsSuperAdminAndAccountStatus(Role.ATTENDANCE_MANAGER) >= maxCount;
	}

	private boolean checkPeopleManagerLimit(SpecialTenantConfig.TenantInfo tenantInfo) {
		int maxCount = tenantInfo != null && tenantInfo.getUserCount() != null ? tenantInfo.getUserCount()
				: EpCommonConstants.ENTERPRISE_FREE_MAX_PEOPLE_MANAGER_COUNT;
		return epEmployeeRoleDao.countByEmployeeRoleIsSuperAdminAndAccountStatus(Role.PEOPLE_MANAGER) >= maxCount;
	}

	private boolean checkSuperAdminLimit(SpecialTenantConfig.TenantInfo tenantInfo) {
		int maxCount = tenantInfo != null && tenantInfo.getUserCount() != null ? tenantInfo.getUserCount()
				: EpCommonConstants.ENTERPRISE_FREE_MAX_SUPER_ADMIN_COUNT;
		return epEmployeeRoleDao.countByEmployeeRoleIsSuperAdminAndAccountStatus(Role.SUPER_ADMIN) >= maxCount;
	}

	private boolean checkEsignSenderLimit(SpecialTenantConfig.TenantInfo tenantInfo) {
		int maxCount = tenantInfo != null && tenantInfo.getUserCount() != null ? tenantInfo.getUserCount()
				: EpCommonConstants.ENTERPRISE_FREE_MAX_ESIGN_SENDER_COUNT;
		return employeeRoleDao.countByEsignRoleAndIsSuperAdmin(Role.ESIGN_SENDER, false) >= maxCount;
	}

}
