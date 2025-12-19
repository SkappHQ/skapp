package com.skapp.community.peopleplanner.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.model.UserSettings;
import com.skapp.community.common.payload.response.BulkStatusSummary;
import com.skapp.community.common.payload.response.NotificationSettingsResponseDto;
import com.skapp.community.common.payload.response.PageDto;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.service.BulkContextService;
import com.skapp.community.common.service.EncryptionDecryptionService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.service.UserVersionService;
import com.skapp.community.common.service.impl.AsyncEmailServiceImpl;
import com.skapp.community.common.type.LoginMethod;
import com.skapp.community.common.type.NotificationSettingsType;
import com.skapp.community.common.type.Role;
import com.skapp.community.common.type.VersionType;
import com.skapp.community.common.util.CommonModuleUtils;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.Validation;
import com.skapp.community.common.util.event.UserCreatedEvent;
import com.skapp.community.common.util.event.UserDeactivatedEvent;
import com.skapp.community.common.util.transformer.PageTransformer;
import com.skapp.community.leaveplanner.type.ManagerType;
import com.skapp.community.peopleplanner.constant.PeopleConstants;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeEducation;
import com.skapp.community.peopleplanner.model.EmployeeEmergency;
import com.skapp.community.peopleplanner.model.EmployeeFamily;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeePeriod;
import com.skapp.community.peopleplanner.model.EmployeePersonalInfo;
import com.skapp.community.peopleplanner.model.EmployeeProgression;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.model.EmployeeVisa;
import com.skapp.community.peopleplanner.model.JobFamily;
import com.skapp.community.peopleplanner.model.JobTitle;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.CurrentEmployeeDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeBulkDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeDataValidationDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeDetailsDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeExportFilterDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeFilterDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeProgressionsDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeQuickAddDto;
import com.skapp.community.peopleplanner.payload.request.NotificationSettingsPatchRequestDto;
import com.skapp.community.peopleplanner.payload.request.PermissionFilterDto;
import com.skapp.community.peopleplanner.payload.request.ProbationPeriodDto;
import com.skapp.community.peopleplanner.payload.request.employee.CreateEmployeeRequestDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeeEmploymentDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeePersonalDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeeSystemPermissionsDto;
import com.skapp.community.peopleplanner.payload.request.employee.emergency.EmployeeEmergencyContactDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentBasicDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentBasicDetailsManagerDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentCareerProgressionDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentVisaDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.personal.EmployeeExtraInfoDto;
import com.skapp.community.peopleplanner.payload.request.employee.personal.EmployeePersonalEducationalDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.personal.EmployeePersonalFamilyDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.personal.EmployeePersonalGeneralDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.personal.EmployeePersonalSocialMediaDetailsDto;
import com.skapp.community.peopleplanner.payload.response.AnalyticsSearchResponseDto;
import com.skapp.community.peopleplanner.payload.response.CreateEmployeeResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeAllDataExportResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeBulkErrorResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeBulkResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeCountDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeCredentialsResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeDataExportResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeDataValidationResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeDetailedResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeManagerDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeManagerResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeePeriodResponseDto;
import com.skapp.community.peopleplanner.payload.response.EmployeeTeamDto;
import com.skapp.community.peopleplanner.payload.response.PrimarySecondaryOrTeamSupervisorResponseDto;
import com.skapp.community.peopleplanner.payload.response.TeamEmployeeResponseDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.EmployeeEducationDao;
import com.skapp.community.peopleplanner.repository.EmployeeFamilyDao;
import com.skapp.community.peopleplanner.repository.EmployeeManagerDao;
import com.skapp.community.peopleplanner.repository.EmployeePeriodDao;
import com.skapp.community.peopleplanner.repository.EmployeeProgressionDao;
import com.skapp.community.peopleplanner.repository.EmployeeTeamDao;
import com.skapp.community.peopleplanner.repository.EmployeeVisaDao;
import com.skapp.community.peopleplanner.repository.JobFamilyDao;
import com.skapp.community.peopleplanner.repository.JobTitleDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.service.EmployeeValidationService;
import com.skapp.community.peopleplanner.service.PeopleEmailService;
import com.skapp.community.peopleplanner.service.PeopleService;
import com.skapp.community.peopleplanner.service.RolesService;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.BulkItemStatus;
import com.skapp.community.peopleplanner.type.EmployeePeriodSort;
import com.skapp.community.peopleplanner.type.EmploymentType;
import com.skapp.community.peopleplanner.util.Validations;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PeopleServiceImpl implements PeopleService {

	protected final UserService userService;

	private final MessageUtil messageUtil;

	private final PeopleMapper peopleMapper;

	private final UserDao userDao;

	private final TeamDao teamDao;

	private final EmployeeDao employeeDao;

	private final JobFamilyDao jobFamilyDao;

	private final JobTitleDao jobTitleDao;

	private final EmployeePeriodDao employeePeriodDao;

	private final EmployeeTeamDao employeeTeamDao;

	private final EmployeeManagerDao employeeManagerDao;

	private final PasswordEncoder passwordEncoder;

	private final RolesService rolesService;

	private final PageTransformer pageTransformer;

	private final PlatformTransactionManager transactionManager;

	private final PeopleEmailService peopleEmailService;

	private final ObjectMapper mapper;

	private final EncryptionDecryptionService encryptionDecryptionService;

	private final BulkContextService bulkContextService;

	private final AsyncEmailServiceImpl asyncEmailServiceImpl;

	protected final ApplicationEventPublisher applicationEventPublisher;

	protected final UserVersionService userVersionService;

	private final EmployeeValidationService employeeValidationService;

	private final EmployeeFamilyDao employeeFamilyDao;

	private final EmployeeEducationDao employeeEducationDao;

	private final EmployeeProgressionDao employeeProgressionDao;

	private final EmployeeVisaDao employeeVisaDao;

	@Value("${encryptDecryptAlgorithm.secret}")
	private String encryptSecret;

	@Override
	@Transactional
	public ResponseEntityDto createEmployee(CreateEmployeeRequestDto requestDto) {
		if (checkUserCountExceeded()) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_LIMIT_EXCEEDED);
		}

		User user = new User();
		Employee employee = new Employee();

		employeeValidationService.validateCreateEmployeeRequestRequiredFields(requestDto, user);
		employeeValidationService.validateCreateEmployeeRequestPersonalDetails(requestDto.getPersonal(), user);
		employeeValidationService.validateCreateEmployeeRequestEmploymentDetails(requestDto.getEmployment(), user);
		rolesService.validateRoles(requestDto.getSystemPermissions(), user);

		employee.setUser(createUserEntity(user, requestDto));
		user.setEmployee(createEmployeeEntity(employee, requestDto));

		userDao.save(user);

		applicationEventPublisher.publishEvent(new UserCreatedEvent(this, user));
		peopleEmailService.sendUserInvitationEmail(user);
		addNewEmployeeTimeLineRecords(employee, requestDto);
		invalidateUserCache();
		invalidateUserAuthPicCache();

		return new ResponseEntityDto(false, processCreateEmployeeResponse(user));
	}

	@Override
	public ResponseEntityDto quickAddEmployee(EmployeeQuickAddDto employeeQuickAddDto) {
		if (checkUserCountExceeded()) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_LIMIT_EXCEEDED);
		}

		User user = new User();
		Employee employee = new Employee();

		CreateEmployeeRequestDto createEmployeeRequestDto = createEmployeeRequest(employeeQuickAddDto);
		employeeValidationService.validateCreateEmployeeRequestRequiredFields(createEmployeeRequestDto, user);

		user.setEmployee(createEmployeeEntity(employee, createEmployeeRequestDto));
		employee.setUser(createUserEntity(user, createEmployeeRequestDto));

		userDao.save(user);

		applicationEventPublisher.publishEvent(new UserCreatedEvent(this, user));
		peopleEmailService.sendUserInvitationEmail(user);
		addNewQuickUploadedEmployeeTimeLineRecords(employee, employeeQuickAddDto);
		updateSubscriptionQuantity(1L, true, false);
		invalidateUserCache();
		invalidateUserAuthPicCache();

		return new ResponseEntityDto(false, processCreateEmployeeResponse(user));
	}

	@Override
	@Transactional
	public ResponseEntityDto updateEmployee(Long employeeId, CreateEmployeeRequestDto requestDto) {
		Optional<User> optionalUser = userDao.findById(employeeId);
		if (optionalUser.isEmpty()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND);
		}

		User user = optionalUser.get();
		Employee employee = user.getEmployee();
		CurrentEmployeeDto currentEmployeeDto = getEmployeeDeepCopy(employee);

		employeeValidationService.validateCreateEmployeeRequestRequiredFields(requestDto, user);
		employeeValidationService.validateCreateEmployeeRequestEmploymentDetails(requestDto.getEmployment(), user);
		employeeValidationService.validateCreateEmployeeRequestPersonalDetails(requestDto.getPersonal(), user);
		rolesService.validateRoles(requestDto.getSystemPermissions(), user);

		employee.setUser(createUserEntity(user, requestDto));
		user.setEmployee(createEmployeeEntity(employee, requestDto));

		userDao.save(user);

		addUpdatedEmployeeTimeLineRecords(currentEmployeeDto, requestDto);
		invalidateUserCache();

		return new ResponseEntityDto(false, requestDto);
	}

	protected void invalidateUserCache() {
		// This method is a placeholder for enterprise cache invalidation logic
	}

	protected void invalidateUserAuthPicCache() {
		// This method is a placeholder for enterprise cache invalidation logic
	}

	protected void enterpriseValidations(String email) {
		// This method is a placeholder for any enterprise-specific validations
	}

	private CreateEmployeeRequestDto createEmployeeRequest(EmployeeQuickAddDto dto) {
		CreateEmployeeRequestDto requestDto = new CreateEmployeeRequestDto();

		EmployeePersonalDetailsDto personalDetails = new EmployeePersonalDetailsDto();
		EmployeePersonalGeneralDetailsDto generalDetails = new EmployeePersonalGeneralDetailsDto();
		generalDetails.setFirstName(dto.getFirstName());
		generalDetails.setLastName(dto.getLastName());
		personalDetails.setGeneral(generalDetails);
		requestDto.setPersonal(personalDetails);

		EmployeeEmploymentDetailsDto employmentDetails = new EmployeeEmploymentDetailsDto();
		EmployeeEmploymentBasicDetailsDto basicDetails = new EmployeeEmploymentBasicDetailsDto();
		basicDetails.setEmail(dto.getEmail());
		employmentDetails.setEmploymentDetails(basicDetails);
		requestDto.setEmployment(employmentDetails);

		requestDto.setSystemPermissions(rolesService.getDefaultEmployeeRoles());

		return requestDto;
	}

	private Employee createEmployeeEntity(Employee employee, CreateEmployeeRequestDto requestDto) {
		// Personal General Information
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getGeneral().getFirstName(),
				employee::setFirstName);
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getGeneral().getMiddleName(),
				employee::setMiddleName);
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getGeneral().getLastName(), employee::setLastName);
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getGeneral().getGender(), employee::setGender);

		// Personal Contact Information
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getContact().getPersonalEmail(),
				employee::setPersonalEmail);
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getContact().getContactNo(), employee::setPhone);
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getContact().getAddressLine1(),
				employee::setAddressLine1);
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getContact().getAddressLine2(),
				employee::setAddressLine2);
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getContact().getCountry(), employee::setCountry);

		// Employment Details
		CommonModuleUtils.setIfExists(() -> requestDto.getEmployment().getEmploymentDetails().getEmployeeNumber(),
				employee::setIdentificationNo);
		CommonModuleUtils.setIfExists(() -> requestDto.getEmployment().getEmploymentDetails().getEmploymentAllocation(),
				employee::setEmploymentAllocation);
		CommonModuleUtils.setIfExists(() -> requestDto.getEmployment().getEmploymentDetails().getJoinedDate(),
				employee::setJoinDate);
		CommonModuleUtils.setIfExists(() -> requestDto.getEmployment().getEmploymentDetails().getWorkTimeZone(),
				employee::setTimeZone);

		// Identification and Diversity Details
		CommonModuleUtils.setIfExists(
				() -> requestDto.getEmployment().getIdentificationAndDiversityDetails().getEeoJobCategory(),
				employee::setEeo);

		// Common Information
		CommonModuleUtils.setIfExists(() -> requestDto.getCommon().getAuthPic(), value -> {
			employee.setAuthPic(value);
			invalidateUserAuthPicCache();
		});

		CommonModuleUtils.setIfRequestValid(requestDto, () -> processEmployeePersonalInfo(requestDto, employee),
				employee::setPersonalInfo);

		CommonModuleUtils.setIfRequestValid(requestDto, () -> processEmergencyContacts(requestDto, employee),
				employee::setEmployeeEmergencies);

		CommonModuleUtils.setIfRequestValid(requestDto, () -> processEmployeeProbationPeriod(requestDto, employee),
				employee::setEmployeePeriods);

		CommonModuleUtils.setIfRequestValid(requestDto, () -> processCareerProgressions(requestDto, employee),
				employee::setEmployeeProgressions);

		CommonModuleUtils.setIfRequestValid(requestDto, () -> processEmployeeVisas(requestDto, employee),
				employee::setEmployeeVisas);

		CommonModuleUtils.setIfRequestValid(requestDto.getPersonal(),
				() -> processEmployeeFamilies(requestDto.getPersonal(), employee), employee::setEmployeeFamilies);

		CommonModuleUtils.setIfRequestValid(requestDto, () -> processEmployeeEducations(requestDto, employee),
				employee::setEmployeeEducations);

		CommonModuleUtils.setIfRequestValid(requestDto.getEmployment(),
				() -> processEmployeeTeams(requestDto.getEmployment(), employee), employee::setEmployeeTeams);

		CommonModuleUtils.setIfRequestValid(requestDto.getEmployment(),
				() -> processEmployeeManagers(requestDto.getEmployment(), employee), employee::setEmployeeManagers);

		CommonModuleUtils.setIfRequestValid(requestDto.getSystemPermissions(),
				() -> rolesService.assignRolesToEmployee(requestDto.getSystemPermissions(), employee),
				employee::setEmployeeRole);

		if (employee.getAccountStatus() == null) {
			employee.setAccountStatus(AccountStatus.PENDING);
		}

		return employee;
	}

	private User createUserEntity(User user, CreateEmployeeRequestDto requestDto) {
		if (requestDto.getEmployment() != null && requestDto.getEmployment().getEmploymentDetails() != null) {
			String email = requestDto.getEmployment().getEmploymentDetails().getEmail();
			if (email != null && !email.isEmpty()) {
				enterpriseValidations(email);
			}
		}

		if (user.getUserId() != null) {
			CommonModuleUtils.setIfExists(() -> createNotificationSettings(requestDto.getSystemPermissions(), user),
					user::setSettings);

			if (user.getEmployee().getAccountStatus() == AccountStatus.PENDING && requestDto.getEmployment() != null
					&& requestDto.getEmployment().getEmploymentDetails() != null
					&& requestDto.getEmployment().getEmploymentDetails().getEmail() != null
					&& !requestDto.getEmployment().getEmploymentDetails().getEmail().isEmpty()) {
				resendInvitationEmail(requestDto, user);
			}

			return user;
		}

		CommonModuleUtils.setIfExists(() -> requestDto.getEmployment().getEmploymentDetails().getEmail(),
				user::setEmail);

		LoginMethod loginMethod = userDao.findById(1L).map(User::getLoginMethod).orElse(LoginMethod.CREDENTIALS);

		if (loginMethod == LoginMethod.CREDENTIALS) {
			String tempPassword = CommonModuleUtils.generateSecureRandomPassword();
			CommonModuleUtils.setIfExists(() -> encryptionDecryptionService.encrypt(tempPassword, encryptSecret),
					user::setTempPassword);
			CommonModuleUtils.setIfExists(() -> passwordEncoder.encode(tempPassword), user::setPassword);
			user.setIsPasswordChangedForTheFirstTime(false);
		}
		else if (loginMethod == LoginMethod.GOOGLE) {
			user.setIsPasswordChangedForTheFirstTime(true);
		}

		CommonModuleUtils.setIfExists(() -> createNotificationSettings(requestDto.getSystemPermissions(), user),
				user::setSettings);

		user.setLoginMethod(loginMethod);
		user.setIsActive(true);

		return user;
	}

	private void resendInvitationEmail(CreateEmployeeRequestDto requestDto, User user) {
		CommonModuleUtils.setIfExists(() -> requestDto.getEmployment().getEmploymentDetails().getEmail(),
				user::setEmail);

		String tempPassword = CommonModuleUtils.generateSecureRandomPassword();
		CommonModuleUtils.setIfExists(() -> encryptionDecryptionService.encrypt(tempPassword, encryptSecret),
				user::setTempPassword);
		CommonModuleUtils.setIfExists(() -> passwordEncoder.encode(tempPassword), user::setPassword);

		peopleEmailService.sendUserInvitationEmail(user);

	}

	private EmployeePersonalInfo processEmployeePersonalInfo(CreateEmployeeRequestDto requestDto, Employee employee) {
		EmployeePersonalInfo personalInfo = employee.getPersonalInfo();
		if (personalInfo == null) {
			personalInfo = new EmployeePersonalInfo();
		}

		// General information
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getGeneral().getDateOfBirth(),
				personalInfo::setBirthDate);
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getGeneral().getNationality(),
				personalInfo::setNationality);
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getGeneral().getNin(), personalInfo::setNin);
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getGeneral().getPassportNumber(),
				personalInfo::setPassportNo);
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getGeneral().getMaritalStatus(),
				personalInfo::setMaritalStatus);

		// Contact information
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getContact().getCity(), personalInfo::setCity);
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getContact().getState(), personalInfo::setState);
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getContact().getPostalCode(),
				personalInfo::setPostalCode);

		// Health information
		CommonModuleUtils.setIfExists(() -> requestDto.getPersonal().getHealthAndOther().getBloodGroup(),
				personalInfo::setBloodGroup);

		// Identification and diversity
		CommonModuleUtils.setIfExists(() -> requestDto.getEmployment().getIdentificationAndDiversityDetails().getSsn(),
				personalInfo::setSsn);
		CommonModuleUtils.setIfExists(
				() -> requestDto.getEmployment().getIdentificationAndDiversityDetails().getEthnicity(),
				personalInfo::setEthnicity);

		// Social media details
		JsonNode oldSocialMediaNode = personalInfo.getSocialMediaDetails();
		EmployeePersonalSocialMediaDetailsDto socialMedia = Optional.ofNullable(oldSocialMediaNode)
			.map(node -> CommonModuleUtils.jsonNodeToValue(node, EmployeePersonalSocialMediaDetailsDto.class, mapper))
			.orElseGet(EmployeePersonalSocialMediaDetailsDto::new);

		var requestSocialMedia = Optional.ofNullable(requestDto.getPersonal())
			.map(EmployeePersonalDetailsDto::getSocialMedia)
			.orElse(null);

		if (requestSocialMedia != null) {
			CommonModuleUtils.setIfExists(requestSocialMedia::getLinkedIn, socialMedia::setLinkedIn);
			CommonModuleUtils.setIfExists(requestSocialMedia::getFacebook, socialMedia::setFacebook);
			CommonModuleUtils.setIfExists(requestSocialMedia::getInstagram, socialMedia::setInstagram);
			CommonModuleUtils.setIfExists(requestSocialMedia::getX, socialMedia::setX);
		}

		personalInfo.setSocialMediaDetails(mapper.valueToTree(socialMedia));

		// Extra Info
		EmployeeExtraInfoDto extraInfo = Optional.of(employee)
			.map(Employee::getPersonalInfo)
			.map(EmployeePersonalInfo::getExtraInfo)
			.map(node -> CommonModuleUtils.jsonNodeToValue(node, EmployeeExtraInfoDto.class, mapper))
			.orElseGet(EmployeeExtraInfoDto::new);

		if (requestDto.getPersonal() != null && requestDto.getPersonal().getHealthAndOther() != null) {
			var healthAndOther = requestDto.getPersonal().getHealthAndOther();
			CommonModuleUtils.setIfExists(healthAndOther::getAllergies, extraInfo::setAllergies);
			CommonModuleUtils.setIfExists(healthAndOther::getTShirtSize, extraInfo::setTShirtSize);
			CommonModuleUtils.setIfExists(healthAndOther::getDietaryRestrictions, extraInfo::setDietaryRestrictions);
		}

		CommonModuleUtils.setIfExists(() -> mapper.valueToTree(extraInfo), personalInfo::setExtraInfo);

		// Previous employment
		CommonModuleUtils.setIfExists(() -> mapper.valueToTree(requestDto.getEmployment().getPreviousEmployment()),
				personalInfo::setPreviousEmploymentDetails);

		personalInfo.setEmployee(employee);
		return personalInfo;
	}

	private List<EmployeeFamily> processEmployeeFamilies(EmployeePersonalDetailsDto personal, Employee employee) {
		if (personal == null || employee == null || personal.getFamily() == null) {
			return new ArrayList<>();
		}

		if (personal.getFamily().isEmpty()) {
			if (employee.getEmployeeFamilies() != null && !employee.getEmployeeFamilies().isEmpty()) {
				List<Long> familyIds = employee.getEmployeeFamilies()
					.stream()
					.map(EmployeeFamily::getFamilyId)
					.filter(Objects::nonNull)
					.toList();

				if (!familyIds.isEmpty()) {
					employeeFamilyDao.deleteAllByFamilyIdIn(familyIds);
					employee.getEmployeeFamilies().clear();
				}
			}
			return new ArrayList<>();
		}

		Set<Long> requestFamilyIds = personal.getFamily()
			.stream()
			.map(EmployeePersonalFamilyDetailsDto::getFamilyId)
			.filter(Objects::nonNull)
			.collect(Collectors.toSet());

		if (employee.getEmployeeId() != null && employee.getEmployeeFamilies() != null
				&& !employee.getEmployeeFamilies().isEmpty()) {
			List<Long> familiesToRemove = employee.getEmployeeFamilies()
				.stream()
				.map(EmployeeFamily::getFamilyId)
				.filter(id -> id != null && !requestFamilyIds.contains(id))
				.toList();

			if (!familiesToRemove.isEmpty()) {
				employeeFamilyDao.deleteAllByFamilyIdIn(familiesToRemove);
				employee.getEmployeeFamilies()
					.removeIf(
							family -> family.getFamilyId() != null && familiesToRemove.contains(family.getFamilyId()));
			}
		}

		List<EmployeeFamily> existingFamilies = employee.getEmployeeFamilies() != null
				? new ArrayList<>(employee.getEmployeeFamilies()) : new ArrayList<>();

		Map<Long, EmployeeFamily> existingFamilyMap = existingFamilies.stream()
			.filter(family -> family.getFamilyId() != null)
			.collect(Collectors.toMap(EmployeeFamily::getFamilyId, family -> family));

		List<EmployeeFamily> result = new ArrayList<>();

		for (EmployeePersonalFamilyDetailsDto dto : personal.getFamily()) {
			EmployeeFamily family = existingFamilyMap.containsKey(dto.getFamilyId())
					? existingFamilyMap.remove(dto.getFamilyId()) : new EmployeeFamily();

			family.setEmployee(employee);

			CommonModuleUtils.setIfNotNull(dto.getFirstName(), family::setFirstName);
			CommonModuleUtils.setIfNotNull(dto.getLastName(), family::setLastName);
			CommonModuleUtils.setIfNotNull(dto.getGender(), family::setGender);
			CommonModuleUtils.setIfNotNull(dto.getRelationship(), family::setFamilyRelationship);
			CommonModuleUtils.setIfNotNull(dto.getDateOfBirth(), family::setBirthDate);
			CommonModuleUtils.setIfNotNull(dto.getParentName(), family::setParentName);

			result.add(family);
		}

		return result;
	}

	private List<EmployeeEducation> processEmployeeEducations(CreateEmployeeRequestDto requestDto, Employee employee) {
		List<EmployeePersonalEducationalDetailsDto> educationalDtos = CommonModuleUtils
			.safeGet(() -> requestDto.getPersonal().getEducational());

		if (educationalDtos == null || employee == null) {
			return employee != null && employee.getEmployeeEducations() != null
					? new ArrayList<>(employee.getEmployeeEducations()) : new ArrayList<>();
		}

		if (educationalDtos.isEmpty()) {
			if (employee.getEmployeeEducations() != null && !employee.getEmployeeEducations().isEmpty()) {
				List<Long> educationIds = employee.getEmployeeEducations()
					.stream()
					.map(EmployeeEducation::getEducationId)
					.filter(Objects::nonNull)
					.toList();

				if (!educationIds.isEmpty()) {
					employeeEducationDao.deleteAllByEducationIdIn(educationIds);
					employee.getEmployeeEducations().clear();
				}
			}
			return new ArrayList<>();
		}

		if (employee.getEmployeeId() != null && employee.getEmployeeEducations() != null
				&& !employee.getEmployeeEducations().isEmpty()) {
			Set<Long> requestEducationIds = educationalDtos.stream()
				.map(EmployeePersonalEducationalDetailsDto::getEducationId)
				.filter(Objects::nonNull)
				.collect(Collectors.toSet());

			List<Long> educationsToRemove = employee.getEmployeeEducations()
				.stream()
				.map(EmployeeEducation::getEducationId)
				.filter(id -> id != null && !requestEducationIds.contains(id))
				.toList();

			if (!educationsToRemove.isEmpty()) {
				employeeEducationDao.deleteAllByEducationIdIn(educationsToRemove);
				employee.getEmployeeEducations()
					.removeIf(education -> education.getEducationId() != null
							&& educationsToRemove.contains(education.getEducationId()));
			}
		}

		List<EmployeeEducation> existingEducations = employee.getEmployeeEducations() != null
				? new ArrayList<>(employee.getEmployeeEducations()) : new ArrayList<>();

		Map<Long, EmployeeEducation> existingEducationMap = existingEducations.stream()
			.filter(education -> education.getEducationId() != null)
			.collect(Collectors.toMap(EmployeeEducation::getEducationId, education -> education));

		List<EmployeeEducation> result = new ArrayList<>();

		for (EmployeePersonalEducationalDetailsDto dto : educationalDtos) {
			EmployeeEducation education = existingEducationMap.containsKey(dto.getEducationId())
					? existingEducationMap.remove(dto.getEducationId()) : new EmployeeEducation();
			education.setEmployee(employee);

			CommonModuleUtils.setIfExists(dto::getInstitutionName, education::setInstitution);
			CommonModuleUtils.setIfExists(dto::getDegree, education::setDegree);
			CommonModuleUtils.setIfExists(dto::getMajor, education::setSpecialization);
			CommonModuleUtils.setIfExists(dto::getStartDate, education::setStartDate);
			CommonModuleUtils.setIfExists(dto::getEndDate, education::setEndDate);

			result.add(education);
		}

		return result;
	}

	private Set<EmployeeTeam> processEmployeeTeams(EmployeeEmploymentDetailsDto requestDto, Employee employee) {
		if (requestDto == null || requestDto.getEmploymentDetails() == null || employee == null) {
			return employee != null && employee.getEmployeeTeams() != null ? employee.getEmployeeTeams()
					: new HashSet<>();
		}

		Long[] teamIds = requestDto.getEmploymentDetails().getTeamIds();
		if (teamIds != null && teamIds.length == 0) {
			if (employee.getEmployeeTeams() != null && !employee.getEmployeeTeams().isEmpty()) {
				List<Long> employeeTeamIds = employee.getEmployeeTeams()
					.stream()
					.map(EmployeeTeam::getId)
					.filter(Objects::nonNull)
					.toList();

				if (!employeeTeamIds.isEmpty()) {
					employeeTeamDao.deleteAllByIdIn(employeeTeamIds);
				}

				employee.getEmployeeTeams().clear();
			}
			return new HashSet<>();
		}

		if (teamIds == null) {
			return employee.getEmployeeTeams() != null ? employee.getEmployeeTeams() : new HashSet<>();
		}

		if (employee.getEmployeeId() != null && employee.getEmployeeTeams() != null
				&& !employee.getEmployeeTeams().isEmpty()) {
			Set<Long> requestTeamIds = Arrays.stream(teamIds).collect(Collectors.toSet());

			List<Long> teamsToRemove = employee.getEmployeeTeams()
				.stream()
				.filter(et -> et.getTeam() != null && !requestTeamIds.contains(et.getTeam().getTeamId()))
				.map(EmployeeTeam::getId)
				.filter(Objects::nonNull)
				.toList();

			if (!teamsToRemove.isEmpty()) {
				employeeTeamDao.deleteAllByIdIn(teamsToRemove);
				employee.getEmployeeTeams()
					.removeIf(team -> team.getId() != null && teamsToRemove.contains(team.getId()));
			}
		}

		Set<EmployeeTeam> existingTeams = employee.getEmployeeTeams() != null ? employee.getEmployeeTeams()
				: new HashSet<>();

		Set<Long> existingTeamIds = existingTeams.stream()
			.map(employeeTeam -> employeeTeam.getTeam() != null ? employeeTeam.getTeam().getTeamId() : null)
			.filter(Objects::nonNull)
			.collect(Collectors.toSet());

		return Arrays.stream(teamIds).map(teamId -> {
			Team team = teamDao.findByTeamId(teamId);
			EmployeeTeam employeeTeam = existingTeamIds.contains(teamId) ? existingTeams.stream()
				.filter(et -> et.getTeam() != null && et.getTeam().getTeamId().equals(teamId))
				.findFirst()
				.orElse(new EmployeeTeam()) : new EmployeeTeam();

			CommonModuleUtils.setIfExists(() -> team, employeeTeam::setTeam);
			CommonModuleUtils.setIfExists(() -> false, employeeTeam::setIsSupervisor);
			CommonModuleUtils.setIfExists(() -> employee, employeeTeam::setEmployee);

			return employeeTeam;
		}).collect(Collectors.toSet());
	}

	private Set<EmployeeManager> processEmployeeManagers(EmployeeEmploymentDetailsDto requestDto, Employee employee) {
		if (requestDto == null || requestDto.getEmploymentDetails() == null || employee == null) {
			return new HashSet<>();
		}

		Set<EmployeeManager> result = new HashSet<>();
		Set<EmployeeManager> existingManagers = employee.getEmployeeManagers() != null
				? new HashSet<>(employee.getEmployeeManagers()) : new HashSet<>();

		EmployeeEmploymentBasicDetailsManagerDetailsDto primarySupervisor = requestDto.getEmploymentDetails()
			.getPrimarySupervisor();
		List<EmployeeEmploymentBasicDetailsManagerDetailsDto> otherSupervisors = requestDto.getEmploymentDetails()
			.getOtherSupervisors();

		Map<Long, EmployeeManager> existingManagerMap = existingManagers.stream()
			.collect(Collectors.toMap(em -> em.getManager().getEmployeeId(), em -> em,
					(existing, replacement) -> existing));

		Set<Long> requestedSupervisorIds = new HashSet<>();

		if (primarySupervisor != null) {
			if (primarySupervisor.getEmployeeId() != null && primarySupervisor.getEmployeeId() > 0) {
				Long primaryId = primarySupervisor.getEmployeeId();
				requestedSupervisorIds.add(primaryId);

				EmployeeManager existingManager = existingManagerMap.get(primaryId);

				if (existingManager != null) {
					existingManager.setManagerType(ManagerType.PRIMARY);
					existingManager.setIsPrimaryManager(true);
					result.add(existingManager);
				}
				else {
					Employee manager = employeeDao.findEmployeeByEmployeeId(primaryId);
					if (manager != null) {
						result.add(createEmployeeManager(employee, manager, ManagerType.PRIMARY, true));
					}
				}
			}
		}
		else {
			existingManagers.stream()
				.filter(em -> em.getManagerType() == ManagerType.PRIMARY)
				.findFirst()
				.ifPresent(em -> {
					requestedSupervisorIds.add(em.getManager().getEmployeeId());
					result.add(em);
				});
		}

		if (otherSupervisors != null) {
			otherSupervisors.stream()
				.map(EmployeeEmploymentBasicDetailsManagerDetailsDto::getEmployeeId)
				.filter(Objects::nonNull)
				.filter(id -> id > 0)
				.filter(id -> !requestedSupervisorIds.contains(id))
				.forEach(secondaryId -> {
					requestedSupervisorIds.add(secondaryId);
					EmployeeManager existingManager = existingManagerMap.get(secondaryId);

					if (existingManager != null) {
						existingManager.setManagerType(ManagerType.SECONDARY);
						existingManager.setIsPrimaryManager(false);
						result.add(existingManager);
					}
					else {
						Employee manager = employeeDao.findEmployeeByEmployeeId(secondaryId);
						if (manager != null) {
							result.add(createEmployeeManager(employee, manager, ManagerType.SECONDARY, false));
						}
					}
				});
		}
		else {
			existingManagers.stream()
				.filter(em -> em.getManagerType() == ManagerType.SECONDARY)
				.filter(em -> !requestedSupervisorIds.contains(em.getManager().getEmployeeId()))
				.forEach(result::add);
		}

		employee.getEmployeeManagers().clear();
		employee.getEmployeeManagers().addAll(result);

		return employee.getEmployeeManagers();
	}

	private EmployeeManager createEmployeeManager(Employee employee, Employee manager, ManagerType type,
			boolean isPrimary) {
		EmployeeManager employeeManager = new EmployeeManager();
		employeeManager.setEmployee(employee);
		employeeManager.setManager(manager);
		employeeManager.setManagerType(type);
		employeeManager.setIsPrimaryManager(isPrimary);
		return employeeManager;
	}

	private List<EmployeeEmergency> processEmergencyContacts(CreateEmployeeRequestDto requestDto, Employee employee) {
		if (requestDto == null || requestDto.getEmergency() == null || employee == null) {
			return new ArrayList<>();
		}

		List<EmployeeEmergency> existingContacts = employee.getEmployeeEmergencies() != null
				? employee.getEmployeeEmergencies() : new ArrayList<>();

		List<EmployeeEmergency> result = new ArrayList<>();

		if (requestDto.getEmergency().getPrimaryEmergencyContact() != null) {
			result.add(processSingleEmergencyContact(requestDto.getEmergency().getPrimaryEmergencyContact(), true,
					employee, existingContacts));
		}

		if (requestDto.getEmergency().getSecondaryEmergencyContact() != null) {
			result.add(processSingleEmergencyContact(requestDto.getEmergency().getSecondaryEmergencyContact(), false,
					employee, existingContacts));
		}

		existingContacts.stream().filter(existing -> !result.contains(existing)).forEach(result::add);

		return result;
	}

	private EmployeeEmergency processSingleEmergencyContact(EmployeeEmergencyContactDetailsDto emergencyDto,
			boolean isPrimary, Employee employee, List<EmployeeEmergency> existingContacts) {
		EmployeeEmergency existingContact = existingContacts.stream()
			.filter(contact -> contact.getIsPrimary() == isPrimary)
			.findFirst()
			.orElse(new EmployeeEmergency());

		existingContact.setEmployee(employee);
		existingContact.setIsPrimary(isPrimary);
		CommonModuleUtils.setIfExists(emergencyDto::getName, existingContact::setName);
		CommonModuleUtils.setIfExists(emergencyDto::getRelationship, existingContact::setEmergencyRelationship);
		CommonModuleUtils.setIfExists(emergencyDto::getContactNo, existingContact::setContactNo);

		return existingContact;
	}

	private List<EmployeeVisa> processEmployeeVisas(CreateEmployeeRequestDto requestDto, Employee employee) {
		if (requestDto == null || requestDto.getEmployment() == null
				|| requestDto.getEmployment().getVisaDetails() == null || employee == null) {
			return employee != null && employee.getEmployeeVisas() != null ? employee.getEmployeeVisas()
					: new ArrayList<>();
		}

		if (requestDto.getEmployment().getVisaDetails().isEmpty()) {
			if (employee.getEmployeeVisas() != null && !employee.getEmployeeVisas().isEmpty()) {
				List<Long> visaIds = new ArrayList<>();
				for (EmployeeVisa visa : employee.getEmployeeVisas()) {
					if (visa.getVisaId() != null) {
						visaIds.add(visa.getVisaId());
					}
				}

				if (!visaIds.isEmpty()) {
					employeeVisaDao.deleteAllByVisaIdIn(visaIds);
				}

				employee.getEmployeeVisas().clear();
			}
			return new ArrayList<>();
		}

		if (employee.getEmployeeId() != null && employee.getEmployeeVisas() != null
				&& !employee.getEmployeeVisas().isEmpty()) {
			Set<Long> requestVisaIds = new HashSet<>();
			for (EmployeeEmploymentVisaDetailsDto visaDetail : requestDto.getEmployment().getVisaDetails()) {
				if (visaDetail.getVisaId() != null) {
					requestVisaIds.add(visaDetail.getVisaId());
				}
			}

			List<Long> visasToRemove = new ArrayList<>();
			for (EmployeeVisa visa : employee.getEmployeeVisas()) {
				if (visa.getVisaId() != null && !requestVisaIds.contains(visa.getVisaId())) {
					visasToRemove.add(visa.getVisaId());
				}
			}

			if (!visasToRemove.isEmpty()) {
				employeeVisaDao.deleteAllByVisaIdIn(visasToRemove);
				employee.getEmployeeVisas()
					.removeIf(visa -> visa.getVisaId() != null && visasToRemove.contains(visa.getVisaId()));
			}
		}

		List<EmployeeVisa> existingVisas = employee.getEmployeeVisas() != null ? employee.getEmployeeVisas()
				: new ArrayList<>();

		Map<Long, EmployeeVisa> existingVisaMap = new HashMap<>();
		for (EmployeeVisa visa : existingVisas) {
			if (visa.getVisaId() != null) {
				existingVisaMap.put(visa.getVisaId(), visa);
			}
		}

		List<EmployeeVisa> updatedVisas = new ArrayList<>();
		for (EmployeeEmploymentVisaDetailsDto dto : requestDto.getEmployment().getVisaDetails()) {
			EmployeeVisa visa;
			if (existingVisaMap.containsKey(dto.getVisaId())) {
				visa = existingVisaMap.remove(dto.getVisaId());
			}
			else {
				visa = new EmployeeVisa();
			}
			visa.setEmployee(employee);

			CommonModuleUtils.setIfExists(dto::getVisaType, visa::setVisaType);
			CommonModuleUtils.setIfExists(dto::getIssuingCountry, visa::setIssuingCountry);
			CommonModuleUtils.setIfExists(dto::getIssuedDate, visa::setIssuedDate);
			CommonModuleUtils.setIfExists(dto::getExpiryDate, visa::setExpirationDate);

			updatedVisas.add(visa);
		}

		return updatedVisas;
	}

	private Set<EmployeePeriod> processEmployeeProbationPeriod(CreateEmployeeRequestDto requestDto, Employee employee) {
		if (requestDto == null || requestDto.getEmployment() == null
				|| requestDto.getEmployment().getEmploymentDetails() == null || employee == null) {
			return employee != null && employee.getEmployeePeriods() != null ? employee.getEmployeePeriods()
				.stream()
				.filter(EmployeePeriod::getIsActive)
				.collect(Collectors.toSet()) : new HashSet<>();
		}

		EmployeeEmploymentBasicDetailsDto employmentDetails = requestDto.getEmployment().getEmploymentDetails();

		Set<EmployeePeriod> existingPeriods = employee.getEmployeePeriods() != null ? employee.getEmployeePeriods()
				: new HashSet<>();

		EmployeePeriod period = existingPeriods.stream()
			.filter(p -> p.getIsActive() != null && p.getIsActive())
			.findFirst()
			.orElse(new EmployeePeriod());

		CommonModuleUtils.setIfExists(employmentDetails::getProbationStartDate, period::setStartDate);
		CommonModuleUtils.setIfExists(employmentDetails::getProbationEndDate, period::setEndDate);
		CommonModuleUtils.setIfExists(() -> true, period::setIsActive);
		CommonModuleUtils.setIfExists(() -> employee, period::setEmployee);

		Set<EmployeePeriod> result = new HashSet<>();
		result.add(period);

		return result;
	}

	private List<EmployeeProgression> processCareerProgressions(CreateEmployeeRequestDto requestDto,
			Employee employee) {
		if (requestDto == null || requestDto.getEmployment() == null
				|| requestDto.getEmployment().getCareerProgression() == null || employee == null) {
			return employee != null && employee.getEmployeeProgressions() != null ? employee.getEmployeeProgressions()
					: new ArrayList<>();
		}

		if (requestDto.getEmployment().getCareerProgression().isEmpty()) {
			if (employee.getEmployeeProgressions() != null && !employee.getEmployeeProgressions().isEmpty()) {
				List<Long> progressionIds = employee.getEmployeeProgressions()
					.stream()
					.map(EmployeeProgression::getProgressionId)
					.filter(Objects::nonNull)
					.toList();

				if (!progressionIds.isEmpty()) {
					employeeProgressionDao.deleteAllByProgressionIdIn(progressionIds);
				}

				employee.getEmployeeProgressions().clear();
				employee.setEmploymentType(null);
				employee.setJobFamily(null);
				employee.setJobTitle(null);
			}
			return new ArrayList<>();
		}

		if (employee.getEmployeeId() != null) {
			Set<Long> requestProgressionIds = requestDto.getEmployment()
				.getCareerProgression()
				.stream()
				.map(EmployeeEmploymentCareerProgressionDetailsDto::getProgressionId)
				.filter(Objects::nonNull)
				.collect(Collectors.toSet());

			if (employee.getEmployeeProgressions() != null && !employee.getEmployeeProgressions().isEmpty()) {
				List<Long> progressionsToRemove = employee.getEmployeeProgressions()
					.stream()
					.map(EmployeeProgression::getProgressionId)
					.filter(id -> id != null && !requestProgressionIds.contains(id))
					.toList();

				if (!progressionsToRemove.isEmpty()) {
					employeeProgressionDao.deleteAllByProgressionIdIn(progressionsToRemove);
					employee.getEmployeeProgressions()
						.removeIf(progression -> progression.getProgressionId() != null
								&& progressionsToRemove.contains(progression.getProgressionId()));
				}
			}
		}

		List<EmployeeProgression> existingProgressions = employee.getEmployeeProgressions() != null
				? employee.getEmployeeProgressions() : new ArrayList<>();

		Map<Long, EmployeeProgression> existingProgressionMap = existingProgressions.stream()
			.filter(progression -> progression.getProgressionId() != null)
			.collect(Collectors.toMap(EmployeeProgression::getProgressionId, progression -> progression));

		List<EmployeeProgression> result = requestDto.getEmployment().getCareerProgression().stream().map(dto -> {
			EmployeeProgression progression = existingProgressionMap.containsKey(dto.getProgressionId())
					? existingProgressionMap.remove(dto.getProgressionId()) : new EmployeeProgression();
			progression.setEmployee(employee);

			CommonModuleUtils.setIfExists(dto::getEmploymentType, progression::setEmploymentType);
			CommonModuleUtils.setIfExists(dto::getJobFamilyId, progression::setJobFamilyId);
			CommonModuleUtils.setIfExists(dto::getJobTitleId, progression::setJobTitleId);
			CommonModuleUtils.setIfExists(dto::getStartDate, progression::setStartDate);
			CommonModuleUtils.setIfExists(dto::getEndDate, progression::setEndDate);
			CommonModuleUtils.setIfExists(dto::getIsCurrentEmployment, progression::setIsCurrent);

			return progression;
		}).collect(Collectors.toList());

		employee.setEmploymentType(null);
		employee.setJobFamily(null);
		employee.setJobTitle(null);

		for (EmployeeEmploymentCareerProgressionDetailsDto dto : requestDto.getEmployment().getCareerProgression()) {
			if (Boolean.TRUE.equals(dto.getIsCurrentEmployment())) {
				employee.setEmploymentType(dto.getEmploymentType());

				if (dto.getJobFamilyId() != null) {
					employee.setJobFamily(jobFamilyDao.getJobFamilyById(dto.getJobFamilyId()));
				}

				if (dto.getJobTitleId() != null) {
					employee.setJobTitle(jobTitleDao.getJobTitleById(dto.getJobTitleId()));
				}
			}
		}

		return result;
	}

	private ResponseEntityDto processCreateEmployeeResponse(User user) {
		Employee employee = user.getEmployee();
		CreateEmployeeResponseDto responseDto = peopleMapper.employeeToCreateEmployeeResponseDto(employee);

		if (user.getLoginMethod() == LoginMethod.CREDENTIALS) {
			EmployeeCredentialsResponseDto credentials = new EmployeeCredentialsResponseDto();
			credentials.setEmail(employee.getUser() != null ? employee.getUser().getEmail() : null);
			credentials.setTempPassword(encryptionDecryptionService.decrypt(user.getTempPassword(), encryptSecret));
			responseDto.setEmployeeCredentials(credentials);
		}

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto getEmployees(EmployeeFilterDto employeeFilterDto) {
		log.info("getEmployees: execution started");
		int pageSize = employeeFilterDto.getSize();

		boolean isExport = employeeFilterDto.getIsExport();
		if (isExport) {
			pageSize = (int) employeeDao.count();
		}

		Pageable pageable = PageRequest.of(employeeFilterDto.getPage(), pageSize,
				Sort.by(employeeFilterDto.getSortOrder(), employeeFilterDto.getSortKey().toString()));

		Page<Employee> employees = employeeDao.findEmployees(employeeFilterDto, pageable);
		PageDto pageDto = pageTransformer.transform(employees);

		List<Long> employeeIds = employees.stream().map(Employee::getEmployeeId).toList();
		List<EmployeeTeamDto> teamList = employeeDao.findTeamsByEmployees(employeeIds);

		if (!isExport) {
			pageDto.setItems(fetchEmployeeSearchData(employees));

			log.info("getEmployees: Successfully executed");
			return new ResponseEntityDto(false, pageDto);
		}
		else {
			List<EmployeeDataExportResponseDto> responseDtos = exportEmployeeData(employees, teamList, employeeIds);
			log.info("getEmployees: Successfully finished returning {} employees on exportEmployeeData",
					responseDtos.size());
			return new ResponseEntityDto(false, responseDtos);
		}
	}

	@Override
	public ResponseEntityDto exportEmployees(EmployeeExportFilterDto employeeExportFilterDto) {
		User currentUser = userService.getCurrentUser();
		log.info("exportEmployees: execution started by user: {}", currentUser.getUserId());

		List<Employee> employees = employeeDao.findEmployeesForExport(employeeExportFilterDto);

		List<Long> employeeIds = employees.stream().map(Employee::getEmployeeId).toList();
		List<EmployeeTeamDto> teamList = employeeDao.findTeamsByEmployees(employeeIds);

		List<EmployeeAllDataExportResponseDto> responseDtos = exportAllEmployeeData(employees, teamList, employeeIds);
		log.info("exportEmployees: Successfully finished returning {} employees on exportEmployeeData",
				responseDtos.size());

		return new ResponseEntityDto(false, responseDtos);
	}

	@Override
	@Transactional
	public ResponseEntityDto getCurrentEmployee() {
		User user = userService.getCurrentUser();
		Optional<Employee> employee = employeeDao.findById(user.getUserId());
		if (employee.isEmpty()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND);
		}

		EmployeeDetailedResponseDto employeeDetailedResponseDto = peopleMapper
			.employeeToEmployeeDetailedResponseDto(employee.get());
		List<EmployeePeriod> period = employeePeriodDao.findEmployeePeriodByEmployee_EmployeeId(
				employee.get().getEmployeeId(), Sort.by(Sort.Direction.DESC, EmployeePeriodSort.ID.getSortField()));

		if (employee.get().getEmployeeRole() != null) {
			employeeDetailedResponseDto
				.setEmployeeRole(peopleMapper.employeeRoleToEmployeeRoleResponseDto(employee.get().getEmployeeRole()));
		}

		if (!period.isEmpty()) {
			EmployeePeriodResponseDto periodResponseDto = peopleMapper
				.employeePeriodToEmployeePeriodResponseDto(period.getFirst());
			employeeDetailedResponseDto.setPeriodResponseDto(periodResponseDto);
		}

		return new ResponseEntityDto(false, employeeDetailedResponseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto addBulkEmployees(List<EmployeeBulkDto> employeeBulkDtoList) {
		List<EmployeeBulkDto> validEmployeeBulkDtoList = getValidEmployeeBulkDtoList(employeeBulkDtoList);
		User currentUser = userService.getCurrentUser();
		log.info("addEmployeeBulk: execution started by user: {}", currentUser.getUserId());

		ExecutorService executorService = Executors.newFixedThreadPool(6);
		List<EmployeeBulkResponseDto> results = Collections.synchronizedList(new ArrayList<>());
		AtomicReference<ResponseEntityDto> outValues = new AtomicReference<>(new ResponseEntityDto());

		List<CompletableFuture<Void>> tasks = createEmployeeTasks(validEmployeeBulkDtoList, executorService, results);
		waitForTaskCompletion(tasks, executorService);

		asyncEmailServiceImpl.sendEmailsInBackground(results);
		List<EmployeeBulkDto> overflowedEmployeeBulkDtoList = getOverFlowedEmployeeBulkDtoList(employeeBulkDtoList,
				validEmployeeBulkDtoList);

		List<EmployeeBulkResponseDto> totalResults = getTotalResultList(results, overflowedEmployeeBulkDtoList);

		int successCount = generateBulkErrorResponse(outValues, employeeBulkDtoList.size(), totalResults);
		updateSubscriptionQuantity(successCount, true, true);

		addNewBulkUploadedEmployeeTimeLineRecords(totalResults);
		invalidateUserCache();
		invalidateUserAuthPicCache();

		return outValues.get();
	}

	@Override
	@Transactional
	public ResponseEntityDto getLoginPendingEmployeeCount() {
		User currentUser = userService.getCurrentUser();
		log.info("getLoginPendingEmployeeCount: execution started by user: {}", currentUser.getUserId());

		EmployeeCountDto employeeCount = employeeDao.getLoginPendingEmployeeCount();
		if (employeeCount == null) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_LOGIN_PENDING_EMPLOYEES_NOT_FOUND);
		}

		return new ResponseEntityDto(false, employeeCount);
	}

	@Override
	@Transactional
	public ResponseEntityDto searchEmployeesByNameOrEmail(PermissionFilterDto permissionFilterDto) {
		log.info("searchEmployeesByNameOrEmail: execution started");

		List<Employee> employees = employeeDao.findEmployeeByNameEmail(permissionFilterDto.getKeyword(),
				permissionFilterDto);
		List<EmployeeDetailedResponseDto> employeeResponseDtos = peopleMapper
			.employeeListToEmployeeDetailedResponseDtoList(employees);

		log.info("searchEmployeesByNameOrEmail: execution ended");
		return new ResponseEntityDto(false, employeeResponseDtos);
	}

	@Override
	@Transactional
	public ResponseEntityDto searchEmployeesByEmail(String email) {
		log.info("searchEmployeesByEmail: execution started");

		Validations.validateEmail(email);
		Boolean isValidEmail = (employeeDao.findEmployeeByEmail(email) != null);

		log.info("searchEmployeesByEmail: execution ended");
		return new ResponseEntityDto(false, isValidEmail);
	}

	@Override
	@Transactional
	public ResponseEntityDto getEmployeeByIdOrEmail(EmployeeDataValidationDto employeeDataValidationDto) {
		log.info("getEmployeeByIdOrEmail: execution started");

		String workEmailCheck = employeeDataValidationDto.getWorkEmail();
		String identificationNoCheck = employeeDataValidationDto.getIdentificationNo();
		Optional<User> newUser = userDao.findByEmail(workEmailCheck);
		List<Employee> newEmployees = employeeDao.findByIdentificationNo(identificationNoCheck);
		EmployeeDataValidationResponseDto employeeDataValidationResponseDto = new EmployeeDataValidationResponseDto();
		employeeDataValidationResponseDto.setIsWorkEmailExists(newUser.isPresent());
		String userDomain = workEmailCheck.substring(workEmailCheck.indexOf("@") + 1);
		employeeDataValidationResponseDto.setIsGoogleDomain(Validation.ssoTypeMatches(userDomain));

		if (!newEmployees.isEmpty()) {
			employeeDataValidationResponseDto.setIsIdentificationNoExists(true);
		}

		log.info("getEmployeeByIdOrEmail: execution ended");
		return new ResponseEntityDto(false, employeeDataValidationResponseDto);
	}

	@Override
	@Transactional
	public ResponseEntityDto terminateUser(Long userId) {
		log.info("terminateUser: execution started");

		updateUserStatus(userId, AccountStatus.TERMINATED, false);

		log.info("terminateUser: execution ended");
		return new ResponseEntityDto(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_SUCCESS_EMPLOYEE_TERMINATED),
				false);
	}

	@Override
	@Transactional
	public ResponseEntityDto deleteUser(Long userId) {
		log.info("deleteUser: execution started");

		updateUserStatus(userId, AccountStatus.DELETED, true);
		log.info("deleteUser: execution ended");

		return new ResponseEntityDto(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_SUCCESS_EMPLOYEE_DELETED),
				false);
	}

	@Override
	@Transactional
	public List<EmployeeManagerResponseDto> getCurrentEmployeeManagers() {
		User user = userService.getCurrentUser();

		List<EmployeeManager> employeeManagers = employeeManagerDao.findByEmployee(user.getEmployee());
		return employeeManagers.stream().map(employeeManager -> {
			EmployeeManagerResponseDto responseDto = new EmployeeManagerResponseDto();
			Employee manager = employeeManager.getManager();

			responseDto.setEmployeeId(manager.getEmployeeId());
			responseDto.setFirstName(manager.getFirstName());
			responseDto.setLastName(manager.getLastName());
			responseDto.setMiddleName(manager.getMiddleName());
			responseDto.setAuthPic(manager.getAuthPic());
			responseDto.setIsPrimaryManager(employeeManager.getIsPrimaryManager());
			responseDto.setManagerType(employeeManager.getManagerType());

			return responseDto;
		}).toList();
	}

	@Override
	public ResponseEntityDto updateNotificationSettings(
			NotificationSettingsPatchRequestDto notificationSettingsPatchRequestDto) {
		log.info("updateNotificationSettings: execution started");

		User currentUser = userService.getCurrentUser();
		Optional<User> optionalUser = userDao.findById(currentUser.getUserId());
		if (optionalUser.isEmpty()) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}
		User user = optionalUser.get();

		UserSettings userSettings;
		if (user.getSettings() != null) {
			userSettings = user.getSettings();
		}
		else {
			userSettings = new UserSettings();
			userSettings.setUser(user);
			user.setSettings(userSettings);
		}

		ObjectNode notificationsObjectNode = mapper.createObjectNode();

		notificationsObjectNode.put(NotificationSettingsType.LEAVE_REQUEST.getKey(),
				notificationSettingsPatchRequestDto.getIsLeaveRequestNotificationsEnabled());
		notificationsObjectNode.put(NotificationSettingsType.TIME_ENTRY.getKey(),
				notificationSettingsPatchRequestDto.getIsTimeEntryNotificationsEnabled());
		notificationsObjectNode.put(NotificationSettingsType.LEAVE_REQUEST_NUDGE.getKey(),
				notificationSettingsPatchRequestDto.getIsLeaveRequestNudgeNotificationsEnabled());

		userSettings.setNotifications(notificationsObjectNode);
		user.setSettings(userSettings);

		userDao.save(user);

		log.info("updateNotificationSettings: execution ended");
		return new ResponseEntityDto(true, "Notification settings updated successfully");
	}

	@Override
	public ResponseEntityDto getNotificationSettings() {
		log.info("getNotificationSettings: execution started");

		User currentUser = userService.getCurrentUser();
		Optional<User> optionalUser = userDao.findById(currentUser.getUserId());
		if (optionalUser.isEmpty()) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND);
		}

		UserSettings userSettings = currentUser.getSettings();
		NotificationSettingsResponseDto userSettingsResponseDto = new NotificationSettingsResponseDto();

		if (userSettings != null && userSettings.getNotifications() != null) {
			JsonNode notifications = userSettings.getNotifications();

			userSettingsResponseDto.setIsLeaveRequestNotificationsEnabled(
					notifications.has(NotificationSettingsType.LEAVE_REQUEST.getKey())
							&& notifications.get(NotificationSettingsType.LEAVE_REQUEST.getKey()).asBoolean());
			userSettingsResponseDto
				.setIsTimeEntryNotificationsEnabled(notifications.has(NotificationSettingsType.TIME_ENTRY.getKey())
						&& notifications.get(NotificationSettingsType.TIME_ENTRY.getKey()).asBoolean());
			userSettingsResponseDto.setIsLeaveRequestNudgeNotificationsEnabled(
					notifications.has(NotificationSettingsType.LEAVE_REQUEST_NUDGE.getKey())
							&& notifications.get(NotificationSettingsType.LEAVE_REQUEST_NUDGE.getKey()).asBoolean());
		}
		else {
			userSettingsResponseDto.setIsLeaveRequestNotificationsEnabled(false);
			userSettingsResponseDto.setIsTimeEntryNotificationsEnabled(false);
			userSettingsResponseDto.setIsLeaveRequestNudgeNotificationsEnabled(false);
		}

		log.info("getNotificationSettings: execution ended");
		return new ResponseEntityDto(true, userSettingsResponseDto);
	}

	@Override
	public boolean isManagerAvailableForCurrentEmployee() {
		User user = userService.getCurrentUser();
		return employeeManagerDao.existsByEmployee(user.getEmployee());
	}

	@Override
	@Transactional
	public ResponseEntityDto searchEmployeesAndTeamsByKeyword(String keyword) {
		User currentUser = userService.getCurrentUser();
		log.info("searchEmployeesAndTeamsByKeyword: execution started by user: {} to search users by the keyword {}",
				currentUser.getUserId(), keyword);

		if (currentUser.getEmployee().getEmployeeRole().getAttendanceRole() == Role.ATTENDANCE_MANAGER
				|| currentUser.getEmployee().getEmployeeRole().getLeaveRole() == Role.LEAVE_MANAGER) {
			List<Team> allTeams = teamDao.findTeamsByName(keyword);
			List<EmployeeTeam> employeeTeams = employeeTeamDao.findEmployeeTeamsByEmployee(currentUser.getEmployee());
			List<EmployeeManager> employeeManagers = employeeManagerDao.findByManager(currentUser.getEmployee());

			List<Team> supervisedTeams = allTeams.stream()
				.filter(team -> employeeTeams.stream()
					.anyMatch(et -> et.getTeam().getTeamId().equals(team.getTeamId()) && et.getIsSupervisor()))
				.toList();

			List<Employee> allEmployees = employeeDao.findEmployeeByName(keyword);

			Set<Long> managedEmployeeIds = employeeManagers.stream()
				.filter(em -> em.getManagerType() == ManagerType.PRIMARY
						|| em.getManagerType() == ManagerType.SECONDARY)
				.map(em -> em.getEmployee().getEmployeeId())
				.collect(Collectors.toSet());

			Set<Long> supervisedEmployeeIds = new HashSet<>();
			boolean isSupervisor = employeeTeams.stream().anyMatch(EmployeeTeam::getIsSupervisor);

			if (isSupervisor) {
				Set<Team> supervisedTeamIds = employeeTeams.stream()
					.filter(EmployeeTeam::getIsSupervisor)
					.map(EmployeeTeam::getTeam)
					.collect(Collectors.toSet());

				List<EmployeeTeam> teamMembers = employeeTeamDao.findByTeamIn(supervisedTeamIds);
				supervisedEmployeeIds = teamMembers.stream()
					.map(et -> et.getEmployee().getEmployeeId())
					.collect(Collectors.toSet());
			}

			Set<Long> finalSupervisedEmployeeIds = supervisedEmployeeIds;
			List<Employee> filteredEmployees = allEmployees.stream()
				.filter(employee -> managedEmployeeIds.contains(employee.getEmployeeId())
						|| finalSupervisedEmployeeIds.contains(employee.getEmployeeId()))
				.toList();

			AnalyticsSearchResponseDto analyticsSearchResponseDto = new AnalyticsSearchResponseDto(
					peopleMapper.employeeListToEmployeeSummarizedResponseDto(filteredEmployees),
					peopleMapper.teamToTeamDetailResponseDto(supervisedTeams));

			log.info("searchEmployeesAndTeamsByKeyword: execution ended by user: {} to search users by the keyword {}",
					currentUser.getUserId(), keyword);
			return new ResponseEntityDto(false, analyticsSearchResponseDto);
		}

		List<Team> teams = teamDao.findTeamsByName(keyword);
		List<Employee> employees = employeeDao.findEmployeeByName(keyword);

		AnalyticsSearchResponseDto analyticsSearchResponseDto = new AnalyticsSearchResponseDto(
				peopleMapper.employeeListToEmployeeSummarizedResponseDto(employees),
				peopleMapper.teamToTeamDetailResponseDto(teams));

		log.info("searchEmployeesAndTeamsByKeyword: execution ended by user: {} to search users by the keyword {}",
				currentUser.getUserId(), keyword);
		return new ResponseEntityDto(false, analyticsSearchResponseDto);
	}

	@Override
	public ResponseEntityDto isPrimarySecondaryOrTeamSupervisor(Long employeeId) {
		User currentUser = userService.getCurrentUser();

		Optional<Employee> employeeOptional = employeeDao.findById(employeeId);
		if (employeeOptional.isEmpty()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND);
		}

		List<EmployeeTeam> currentEmployeeTeams = employeeTeamDao
			.findEmployeeTeamsByEmployee(currentUser.getEmployee());
		List<EmployeeTeam> employeeTeams = employeeTeamDao.findEmployeeTeamsByEmployee(employeeOptional.get());

		PrimarySecondaryOrTeamSupervisorResponseDto primarySecondaryOrTeamSupervisor = employeeDao
			.isPrimarySecondaryOrTeamSupervisor(employeeOptional.get(), currentUser.getEmployee());

		boolean isTeamSupervisor = currentEmployeeTeams.stream()
			.anyMatch(currentTeam -> employeeTeams.stream()
				.anyMatch(empTeam -> currentTeam.getTeam().equals(empTeam.getTeam()) && currentTeam.getIsSupervisor()));

		primarySecondaryOrTeamSupervisor.setIsTeamSupervisor(isTeamSupervisor);
		return new ResponseEntityDto(false, primarySecondaryOrTeamSupervisor);
	}

	@Override
	public ResponseEntityDto hasSupervisoryRoles(Long employeeId) {

		Optional<Employee> employeeOptional = employeeDao.findById(employeeId);
		if (employeeOptional.isEmpty()) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND);
		}

		List<EmployeeTeam> employeeTeams = employeeTeamDao.findEmployeeTeamsByEmployee(employeeOptional.get());

		PrimarySecondaryOrTeamSupervisorResponseDto primarySecondaryOrTeamSupervisor = employeeDao
			.isPrimaryOrSecondarySupervisor(employeeOptional.get());

		boolean isTeamSupervisor = employeeTeams.stream()
			.anyMatch(currentTeam -> employeeTeams.stream()
				.anyMatch(empTeam -> currentTeam.getTeam().equals(empTeam.getTeam()) && currentTeam.getIsSupervisor()));

		primarySecondaryOrTeamSupervisor.setIsTeamSupervisor(isTeamSupervisor);
		return new ResponseEntityDto(false, primarySecondaryOrTeamSupervisor);
	}

	public List<EmployeeAllDataExportResponseDto> exportAllEmployeeData(List<Employee> employees,
			List<EmployeeTeamDto> teamList, List<Long> employeeIds) {
		List<EmployeeManagerDto> employeeManagerDtos = employeeDao.findManagersByEmployeeIds(employeeIds);
		List<EmployeeAllDataExportResponseDto> responseDtos = new ArrayList<>();

		for (Employee employee : employees) {
			EmployeeAllDataExportResponseDto responseDto = peopleMapper
				.employeeToEmployeeAllDataExportResponseDto(employee);
			responseDto.setJobFamily(peopleMapper.jobFamilyToJobFamilyDto(employee.getJobFamily()));
			responseDto.setJobTitle(peopleMapper.jobTitleToJobTitleDto(employee.getJobTitle()));
			responseDto.setEmployeePersonalInfoDto(
					peopleMapper.employeePersonalInfoToEmployeePersonalInfoDto(employee.getPersonalInfo()));
			responseDto.setEmployeeEmergencyDto(
					peopleMapper.employeeEmergencyToemployeeEmergencyDTo(employee.getEmployeeEmergencies()));

			List<Team> teams = teamList.stream()
				.filter(e -> Objects.equals(e.getEmployeeId(), employee.getEmployeeId()))
				.map(EmployeeTeamDto::getTeam)
				.toList();
			responseDto.setTeamResponseDto(peopleMapper.teamListToTeamResponseDtoList(teams));

			List<Employee> managers = employeeManagerDtos.stream()
				.filter(e -> Objects.equals(e.getEmployeeId(), employee.getEmployeeId()))
				.map(EmployeeManagerDto::getManagers)
				.toList();
			responseDto.setManagers(peopleMapper.employeeListToEmployeeResponseDtoList(managers));

			Optional<EmployeePeriod> period = employeePeriodDao
				.findEmployeePeriodByEmployee_EmployeeIdAndIsActiveTrue(employee.getEmployeeId());
			period.ifPresent(employeePeriod -> responseDto
				.setEmployeePeriod(peopleMapper.employeePeriodToEmployeePeriodResponseDto(employeePeriod)));

			responseDtos.add(responseDto);
		}
		return responseDtos;
	}

	public void setBulkManagers(EmployeeBulkDto employeeBulkDto, EmployeeDetailsDto employeeDetailsDto) {
		if (employeeBulkDto.getPrimaryManager() != null) {
			Optional<User> byEmail = userDao.findByEmail(employeeBulkDto.getPrimaryManager());
			if (byEmail.isPresent()) {
				Optional<Employee> managerPrimary = employeeDao.findById(byEmail.get().getUserId());
				managerPrimary.ifPresent(value -> employeeDetailsDto.setPrimaryManager(value.getEmployeeId()));
			}
		}

	}

	public void setBulkEmployeeProgression(EmployeeBulkDto employeeBulkDto, Employee employee) {
		if (employeeBulkDto.getEmployeeProgression() != null) {
			EmployeeProgression employeeProgression = peopleMapper
				.employeeProgressionDtoToEmployeeProgression(employeeBulkDto.getEmployeeProgression());
			if (employeeBulkDto.getEmployeeProgression().getEmploymentType() != null) {
				employee.setEmploymentType(employeeBulkDto.getEmployeeProgression().getEmploymentType());
			}

			if (employeeBulkDto.getEmployeeProgression().getJobFamilyId() != null) {
				employeeProgression.setJobFamilyId(employeeBulkDto.getEmployeeProgression().getJobFamilyId());
			}

			if (employeeBulkDto.getEmployeeProgression().getJobTitleId() != null) {
				employeeProgression.setJobTitleId(employeeBulkDto.getEmployeeProgression().getJobTitleId());
			}

			employeeProgression.setEmployee(employee);

			if (employeeBulkDto.getEmployeeProgression().getJobTitleId() != null
					&& employeeBulkDto.getEmployeeProgression().getJobFamilyId() != null)
				employee.setEmployeeProgressions(List.of(employeeProgression));
		}
	}

	public List<EmployeeDetailedResponseDto> fetchEmployeeSearchData(Page<Employee> employees) {
		List<EmployeeDetailedResponseDto> responseDtos = new ArrayList<>();
		for (Employee employee : employees.getContent()) {

			EmployeeDetailedResponseDto responseDto = peopleMapper.employeeToEmployeeDetailedResponseDto(employee);
			responseDto.setJobFamily(peopleMapper.jobFamilyToEmployeeJobFamilyDto(employee.getJobFamily()));
			Optional<EmployeePeriod> period = employeePeriodDao
				.findEmployeePeriodByEmployee_EmployeeIdAndIsActiveTrue(employee.getEmployeeId());
			period.ifPresent(employeePeriod -> responseDto
				.setPeriodResponseDto(peopleMapper.employeePeriodToEmployeePeriodResponseDto(employeePeriod)));
			responseDtos.add(responseDto);

			List<EmployeeTeam> teamList = employeeTeamDao.findByEmployee(employee);
			if (!teamList.isEmpty()) {
				List<TeamEmployeeResponseDto> teamDtos = teamList.stream()
					.map(peopleMapper::employeeTeamToEmployeeTeamDto)
					.toList();
				responseDto.setTeams(teamDtos);
			}

		}
		return responseDtos;
	}

	public void validateNIN(String nin, List<String> errors) {
		if (!nin.trim().matches(Validation.VALID_NIN_NUMBER_REGEXP))
			errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_NIN));

		if (nin.length() > PeopleConstants.MAX_NIN_LENGTH)
			errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_NIN_LENGTH,
					new Object[] { PeopleConstants.MAX_NIN_LENGTH }));
	}

	public void validatePassportNumber(String passportNumber, List<String> errors) {
		if (passportNumber != null && (!passportNumber.trim().matches(Validation.ALPHANUMERIC_REGEX))) {
			errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_PASSPORT));
		}

		if (passportNumber != null && passportNumber.length() > PeopleConstants.MAX_NIN_LENGTH)
			errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_PASSPORT_LENGTH,
					new Object[] { PeopleConstants.MAX_NIN_LENGTH }));
	}

	public void validateIdentificationNo(String identificationNo, List<String> errors) {
		if (!Validations.isValidIdentificationNo(identificationNo)) {
			errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_IDENTIFICATION_NUMBER));
		}

		if (identificationNo.length() > PeopleConstants.MAX_ID_LENGTH)
			errors
				.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_IDENTIFICATION_NUMBER_LENGTH,
						new Object[] { PeopleConstants.MAX_ID_LENGTH }));
	}

	public void validateSocialSecurityNumber(String socialSecurityNumber, List<String> errors) {
		if (socialSecurityNumber != null && (!socialSecurityNumber.trim().matches(Validation.ALPHANUMERIC_REGEX))) {
			errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_SSN));
		}

		if (socialSecurityNumber != null && socialSecurityNumber.length() > PeopleConstants.MAX_SSN_LENGTH)
			errors.add(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_EXCEEDING_MAX_CHARACTER_LIMIT,
					new Object[] { PeopleConstants.MAX_SSN_LENGTH, "First Name" }));
	}

	public void validateAddressInBulk(String addressLine, List<String> errors) {
		if (!addressLine.trim().matches(Validation.ADDRESS_REGEX))
			errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_ADDRESS));

		if (addressLine.length() > PeopleConstants.MAX_ADDRESS_LENGTH)
			errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_ADDRESS_LENGTH,
					new Object[] { PeopleConstants.MAX_ADDRESS_LENGTH }));

	}

	public void validateStateInBulk(String state, List<String> errors) {
		if (state != null && (!state.trim().matches(Validation.ADDRESS_REGEX))) {
			errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_CITY));
		}

		if (state != null && state.length() > PeopleConstants.MAX_ADDRESS_LENGTH)
			errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_STATE_PROVINCE,
					new Object[] { PeopleConstants.MAX_ADDRESS_LENGTH }));
	}

	public void validateCityInBulk(String city, List<String> errors) {
		if (city != null && (!city.trim().matches(Validation.ADDRESS_REGEX))) {
			errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_STATE));
		}

		if (city != null && city.length() > PeopleConstants.MAX_ADDRESS_LENGTH)
			errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_STATE_PROVINCE,
					new Object[] { PeopleConstants.MAX_ADDRESS_LENGTH }));
	}

	public void validateFirstName(String firstName, List<String> errors) {
		if (firstName != null && firstName.length() > PeopleConstants.MAX_NAME_LENGTH)
			errors.add(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_EXCEEDING_MAX_CHARACTER_LIMIT,
					new Object[] { PeopleConstants.MAX_NAME_LENGTH, "First Name" }));

	}

	public void validateLastName(String lastName, List<String> errors) {
		if (lastName != null && lastName.length() > PeopleConstants.MAX_NAME_LENGTH)
			errors.add(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_EXCEEDING_MAX_CHARACTER_LIMIT,
					new Object[] { PeopleConstants.MAX_NAME_LENGTH, "Last Name" }));
	}

	public void validateEmergencyContactName(String name, List<String> errors) {
		if (name != null && name.length() > PeopleConstants.MAX_NAME_LENGTH)
			errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_NAME_LENGTH,
					new Object[] { PeopleConstants.MAX_NAME_LENGTH }));
	}

	public void validatePhoneNumberInBulk(String phone, List<String> errors) {
		if (phone != null && !Validations.isValidPhoneNumber(phone)) {
			errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_PHONE_NUMBER));
		}

		if (phone != null && phone.length() > PeopleConstants.MAX_PHONE_LENGTH)
			errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_PHONE_NUMBER_LENGTH,
					new Object[] { PeopleConstants.MAX_PHONE_LENGTH }));
	}

	public void validateEmergencyContactNumberInBulk(String phone, List<String> errors) {
		if (!Validations.isValidPhoneNumber(phone)) {
			errors.add(messageUtil
				.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_EMERGENCY_CONTACT_PHONE_NUMBER));
		}
	}

	protected EmployeeBulkResponseDto createErrorResponse(EmployeeBulkDto employeeBulkDto, String message) {
		EmployeeBulkResponseDto bulkResponseDto = new EmployeeBulkResponseDto();
		bulkResponseDto.setEmail(employeeBulkDto.getWorkEmail() != null ? employeeBulkDto.getWorkEmail()
				: employeeBulkDto.getPersonalEmail());
		bulkResponseDto.setStatus(BulkItemStatus.ERROR);
		bulkResponseDto.setMessage(message);
		return bulkResponseDto;
	}

	protected List<EmployeeBulkDto> getValidEmployeeBulkDtoList(List<EmployeeBulkDto> employeeBulkDtoList) {
		return employeeBulkDtoList;
	}

	protected List<EmployeeBulkResponseDto> getTotalResultList(List<EmployeeBulkResponseDto> results,
			List<EmployeeBulkDto> overflowedEmployeeBulkDtoList) {
		if (!overflowedEmployeeBulkDtoList.isEmpty())
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_BULK_LIMIT_EXCEEDED);

		return results;
	}

	/**
	 * This method is only available for Pro tenants.
	 * @param isFromEmployeeBulk is the update from employee bulk upload.
	 */
	protected void updateSubscriptionQuantity(long quantity, boolean isIncrement, boolean isFromEmployeeBulk) {
		log.info("updateSubscriptionQuantity: PRO feature {}, {}", quantity, isIncrement);
	}

	@Override
	public void modifySubscriptionQuantity(long quantity, boolean isIncrement, boolean isFromEmployeeBulk) {
		updateSubscriptionQuantity(quantity, isIncrement, isFromEmployeeBulk);
	}

	/**
	 * Validate the current user count with the user limit. This method is only available
	 * for Pro tenants.
	 * @return eligibility for a new user upload.
	 */
	protected boolean checkUserCountExceeded() {
		return false;
	}

	/**
	 * Retrieves a deep copy of the given employee. This method is only available for Pro
	 * tenants.
	 * @param currentEmployee The employee to create a deep copy from.
	 * @return A deep copy of the given employee as a CurrentEmployeeDto.
	 */
	protected CurrentEmployeeDto getEmployeeDeepCopy(Employee currentEmployee) {
		return null;
	}

	/**
	 * Adds a new timeline record when a new employee is created. This feature is
	 * available only for Pro tenants.
	 * @param savedEmployee The newly saved employee entity.
	 * @param employeeDetailsDto The details of the newly created employee.
	 */
	protected void addNewEmployeeTimeLineRecords(Employee savedEmployee, CreateEmployeeRequestDto employeeDetailsDto) {
		// This feature is available only for Pro tenants.
	}

	/**
	 * Adds a new timeline record for employees who are added via quick upload. This
	 * feature is available only for Pro tenants.
	 * @param savedEmployee The employee added through quick upload.
	 * @param employeeQuickAddDto The quick-add details of the employee.
	 */
	protected void addNewQuickUploadedEmployeeTimeLineRecords(Employee savedEmployee,
			EmployeeQuickAddDto employeeQuickAddDto) {
		// This feature is available only for Pro tenants.
	}

	/**
	 * Adds new timeline records for employees who are added via bulk upload. This feature
	 * is available only for Pro tenants.
	 * @param results The employees added through bulk upload.
	 */
	protected void addNewBulkUploadedEmployeeTimeLineRecords(List<EmployeeBulkResponseDto> results) {
		// This feature is available only for Pro tenants.
	}

	/**
	 * Adds a new timeline record when an existing employee's details are updated. This
	 * feature is available only for Pro tenants.
	 * @param currentEmployee The current state of the employee before the update.
	 * @param createEmployeeRequestDto The updated details of the employee.
	 */
	protected void addUpdatedEmployeeTimeLineRecords(CurrentEmployeeDto currentEmployee,
			CreateEmployeeRequestDto createEmployeeRequestDto) {
		// This feature is available only for Pro tenants.
	}

	private void handleGeneralException(EmployeeBulkDto employeeBulkDto, Exception e,
			List<EmployeeBulkResponseDto> results) {
		log.warn("addEmployeeBulk: exception occurred when saving : {}", e.getMessage());
		EmployeeBulkResponseDto bulkResponseDto = createErrorResponse(employeeBulkDto, e.getMessage());
		results.add(bulkResponseDto);
	}

	private EmployeeBulkResponseDto createSuccessResponse(EmployeeBulkDto employeeBulkDto, String message) {
		EmployeeBulkResponseDto bulkResponseDto = new EmployeeBulkResponseDto();
		bulkResponseDto.setEmail(employeeBulkDto.getWorkEmail() != null ? employeeBulkDto.getWorkEmail()
				: employeeBulkDto.getPersonalEmail());
		bulkResponseDto.setStatus(BulkItemStatus.SUCCESS);
		bulkResponseDto.setMessage(message);
		return bulkResponseDto;
	}

	private void waitForTaskCompletion(List<CompletableFuture<Void>> tasks, ExecutorService executorService) {
		CompletableFuture<Void> allTasks = CompletableFuture.allOf(tasks.toArray(new CompletableFuture[0]));
		allTasks.thenRun(executorService::shutdown);
		allTasks.join();

		try {
			if (!executorService.awaitTermination(5, TimeUnit.MINUTES)) {
				log.error("addEmployeeBulk: ExecutorService Failed to terminate after 5 minutes");
				log.error("addEmployeeBulk: Forcefully shutting down ExecutorService");
				List<Runnable> pendingTasks = executorService.shutdownNow();
				log.error("addEmployeeBulk: Found {} pending tasks while forcefully shutting down",
						pendingTasks.size());
			}
		}
		catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			log.error("addEmployeeBulk: Interrupted while waiting to terminate the ExecutorService", e);
		}
		catch (Exception e) {
			log.error("addEmployeeBulk: Error occurred while waiting to terminate the ExecutorService: {}",
					e.getMessage());
		}

		log.info("addEmployeeBulk: is executor shut down success : {}", executorService.isShutdown());
		log.info("addEmployeeBulk: all the tasks termination success after executor shut down : {}",
				executorService.isTerminated());
	}

	private int generateBulkErrorResponse(AtomicReference<ResponseEntityDto> outValues, int totalSize,
			List<EmployeeBulkResponseDto> results) {
		EmployeeBulkErrorResponseDto errorResponseDto = new EmployeeBulkErrorResponseDto();

		List<EmployeeBulkResponseDto> errorResults = results.stream()
			.filter(responseDto -> responseDto.getStatus() == BulkItemStatus.ERROR)
			.toList();

		int successCount = totalSize - errorResults.size();
		errorResponseDto.setBulkStatusSummary(new BulkStatusSummary(successCount, errorResults.size()));
		errorResponseDto.setBulkRecordErrorLogs(errorResults);
		outValues.set(new ResponseEntityDto(false, errorResponseDto));

		return successCount;
	}

	private void createNewEmployeeFromBulk(EmployeeBulkDto employeeBulkDto) {
		List<String> validationErrors = validateEmployeeBulkDto(employeeBulkDto);
		if (!validationErrors.isEmpty()) {
			throw new ValidationException(
					PeopleMessageConstant.PEOPLE_ERROR_USER_ENTITLEMENT_BULK_UPLOAD_VALIDATION_FAILED,
					validationErrors);
		}

		if (employeeBulkDto.getIdentificationNo() != null)
			employeeBulkDto.setIdentificationNo(employeeBulkDto.getIdentificationNo().toUpperCase());

		Employee employee = peopleMapper.employeeBulkDtoToEmployee(employeeBulkDto);
		EmployeeDetailsDto employeeDetailsDto = peopleMapper.employeeBulkDtoToEmployeeDetailsDto(employeeBulkDto);

		User user = employee.getUser();
		user.setEmail(employeeBulkDto.getWorkEmail());
		user.setIsActive(true);

		User firstUser = userDao.findById(1L)
			.orElseThrow(() -> new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND));
		LoginMethod loginMethod = firstUser.getLoginMethod();

		if (loginMethod.equals(LoginMethod.GOOGLE)) {
			user.setIsPasswordChangedForTheFirstTime(true);
			user.setLoginMethod(LoginMethod.GOOGLE);
		}
		else {
			String tempPassword = CommonModuleUtils.generateSecureRandomPassword();

			user.setTempPassword(encryptionDecryptionService.encrypt(tempPassword, encryptSecret));
			user.setPassword(passwordEncoder.encode(tempPassword));
			user.setIsPasswordChangedForTheFirstTime(false);

			user.setIsPasswordChangedForTheFirstTime(false);
			user.setLoginMethod(LoginMethod.CREDENTIALS);
		}

		setBulkEmployeeProgression(employeeBulkDto, employee);
		setBulkManagers(employeeBulkDto, employeeDetailsDto);

		Set<EmployeeManager> managers = addNewManagers(employeeDetailsDto, employee);
		employee.setEmployeeManagers(managers);

		if (employeeBulkDto.getEmployeeEmergency() != null && (employeeBulkDto.getEmployeeEmergency().getName() != null
				|| employeeBulkDto.getEmployeeEmergency().getContactNo() != null)) {
			EmployeeEmergency employeeEmergency = peopleMapper
				.employeeEmergencyDtoToEmployeeEmergency(employeeBulkDto.getEmployeeEmergency());
			employeeEmergency.setEmployee(employee);
			employee.setEmployeeEmergencies(List.of(employeeEmergency));
		}

		if (employeeDetailsDto.getEmployeePersonalInfo() != null) {
			EmployeePersonalInfo employeePersonalInfo = peopleMapper
				.employeePersonalInfoDtoToEmployeePersonalInfo(employeeDetailsDto.getEmployeePersonalInfo());
			employeePersonalInfo.setEmployee(employee);
			employee.setPersonalInfo(employeePersonalInfo);
		}

		employee.setAccountStatus(employeeBulkDto.getAccountStatus());
		employee.setEmploymentAllocation(employeeBulkDto.getEmploymentAllocation());

		UserSettings userSettings = createNotificationSettingsForBulkUser(user);
		user.setSettings(userSettings);

		userDao.save(user);
		applicationEventPublisher.publishEvent(new UserCreatedEvent(this, user));

		rolesService.saveEmployeeRoles(employee);
		saveEmployeeProgression(employee, employeeBulkDto);

		if (employeeBulkDto.getTeams() != null && !employeeBulkDto.getTeams().isEmpty()) {
			saveEmployeeTeams(employee, employeeBulkDto);
		}

		if (employeeBulkDto.getEmployeePeriod() != null) {
			saveEmployeePeriod(employee, employeeBulkDto.getEmployeePeriod());
		}
	}

	private void saveEmployeeTeams(Employee employee, EmployeeBulkDto employeeBulkDto) {
		if (employeeBulkDto.getTeams() != null) {
			Set<EmployeeTeam> employeeTeams = getEmployeeTeamsByName(employeeBulkDto.getTeams(), employee);
			employeeTeamDao.saveAll(employeeTeams);
		}
	}

	private void saveEmployeeProgression(Employee employee, EmployeeBulkDto employeeBulkDto) {
		if (employeeBulkDto.getJobFamily() != null || employeeBulkDto.getJobTitle() != null
				|| employeeBulkDto.getEmployeeType() != null) {
			List<EmployeeProgression> employeeProgressions = new ArrayList<>();
			EmployeeProgression employeeProgression = new EmployeeProgression();

			if (employeeBulkDto.getJobFamily() != null && !employeeBulkDto.getJobFamily().isEmpty()) {
				JobFamily jobFamily = jobFamilyDao.getJobFamilyByName(employeeBulkDto.getJobFamily());

				if (jobFamily != null) {
					employee.setJobFamily(jobFamily);
					employeeProgression.setJobFamilyId(jobFamily.getJobFamilyId());
				}
			}

			if (employeeBulkDto.getJobTitle() != null && !employeeBulkDto.getJobTitle().isEmpty()) {
				JobTitle jobTitle = jobTitleDao.getJobTitleByName(employeeBulkDto.getJobTitle());

				if (jobTitle != null) {
					employee.setJobTitle(jobTitle);
					employeeProgression.setJobTitleId(jobTitle.getJobTitleId());
				}
			}

			if (employeeBulkDto.getEmployeeType() != null && !employeeBulkDto.getEmployeeType().isEmpty()) {
				employeeProgression.setEmploymentType(EmploymentType.valueOf(employeeBulkDto.getEmployeeType()));
			}

			employeeProgression.setEmployee(employee);
			employeeProgressions.add(employeeProgression);
			employee.setEmployeeProgressions(employeeProgressions);

			employeeDao.save(employee);
		}
	}

	private void validateMandatoryFields(EmployeeBulkDto employeeBulkDto) {
		List<String> missedFields = new ArrayList<>();

		if (employeeBulkDto.getFirstName() == null) {
			missedFields.add("First name");
		}
		if (employeeBulkDto.getLastName() == null) {
			missedFields.add("Last name");
		}

		if (employeeBulkDto.getWorkEmail() == null) {
			missedFields.add("Work Email");
		}

		if (!missedFields.isEmpty()) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_MISSING_USER_BULK_MANDATORY_FIELDS,
					missedFields);
		}
	}

	public List<EmployeeDataExportResponseDto> exportEmployeeData(Page<Employee> employees,
			List<EmployeeTeamDto> teamList, List<Long> employeeIds) {
		List<EmployeeManagerDto> employeeManagerDtos = employeeDao.findManagersByEmployeeIds(employeeIds);
		List<EmployeeDataExportResponseDto> responseDtos = new ArrayList<>();
		for (Employee employee : employees.getContent()) {
			EmployeeDataExportResponseDto responseDto = peopleMapper.employeeToEmployeeDataExportResponseDto(employee);
			responseDto.setJobFamily(peopleMapper.jobFamilyToJobFamilyDto(employee.getJobFamily()));
			responseDto.setJobTitle(peopleMapper.jobTitleToJobTitleDto(employee.getJobTitle()));

			List<Team> teams = teamList.stream()
				.filter(e -> Objects.equals(e.getEmployeeId(), employee.getEmployeeId()))
				.map(EmployeeTeamDto::getTeam)
				.toList();

			responseDto.setTeamResponseDto(peopleMapper.teamListToTeamResponseDtoList(teams));

			List<Employee> managers = employeeManagerDtos.stream()
				.filter(e -> Objects.equals(e.getEmployeeId(), employee.getEmployeeId()))
				.map(EmployeeManagerDto::getManagers)
				.toList();
			responseDto.setManagers(peopleMapper.employeeListToEmployeeResponseDtoList(managers));
			Optional<EmployeePeriod> period = employeePeriodDao
				.findEmployeePeriodByEmployee_EmployeeIdAndIsActiveTrue(employee.getEmployeeId());
			period.ifPresent(employeePeriod -> responseDto
				.setEmployeePeriod(peopleMapper.employeePeriodToEmployeePeriodResponseDto(employeePeriod)));
			responseDtos.add(responseDto);
		}
		return responseDtos;
	}

	private TransactionTemplate getTransactionManagerTemplate() {
		TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
		transactionTemplate.setPropagationBehavior(Propagation.REQUIRED.value());
		transactionTemplate.setIsolationLevel(Isolation.DEFAULT.value());
		return transactionTemplate;
	}

	private UserSettings createNotificationSettingsForBulkUser(User user) {
		log.info("createNotificationSettingsForBulkUser: execution started");
		UserSettings userSettings = new UserSettings();

		EmployeeRole employeeRole = rolesService.setupBulkEmployeeRoles(user.getEmployee());
		ObjectNode notificationsObjectNode = mapper.createObjectNode();

		boolean isLeaveRequestNotificationsEnabled = true;
		boolean isTimeEntryNotificationsEnabled = true;
		boolean isNudgeNotificationsEnabled = employeeRole.getIsSuperAdmin()
				|| employeeRole.getLeaveRole() == Role.LEAVE_MANAGER || employeeRole.getLeaveRole() == Role.LEAVE_ADMIN;

		notificationsObjectNode.put(NotificationSettingsType.LEAVE_REQUEST.getKey(),
				isLeaveRequestNotificationsEnabled);
		notificationsObjectNode.put(NotificationSettingsType.TIME_ENTRY.getKey(), isTimeEntryNotificationsEnabled);
		notificationsObjectNode.put(NotificationSettingsType.LEAVE_REQUEST_NUDGE.getKey(), isNudgeNotificationsEnabled);

		userSettings.setNotifications(notificationsObjectNode);
		userSettings.setUser(user);

		log.info("createNotificationSettingsForBulkUser: execution ended");
		return userSettings;
	}

	private UserSettings createNotificationSettings(EmployeeSystemPermissionsDto roleRequestDto, User user) {
		log.info("createNotificationSettings: execution started");
		UserSettings userSettings = user.getSettings();
		if (userSettings == null) {
			userSettings = new UserSettings();
		}

		ObjectNode notificationsObjectNode = mapper.createObjectNode();

		boolean isLeaveRequestNotificationsEnabled = true;
		boolean isTimeEntryNotificationsEnabled = true;
		boolean isNudgeNotificationsEnabled = roleRequestDto.getIsSuperAdmin()
				|| roleRequestDto.getLeaveRole() == Role.LEAVE_MANAGER
				|| roleRequestDto.getLeaveRole() == Role.LEAVE_ADMIN;

		notificationsObjectNode.put(NotificationSettingsType.LEAVE_REQUEST.getKey(),
				isLeaveRequestNotificationsEnabled);
		notificationsObjectNode.put(NotificationSettingsType.TIME_ENTRY.getKey(), isTimeEntryNotificationsEnabled);
		notificationsObjectNode.put(NotificationSettingsType.LEAVE_REQUEST_NUDGE.getKey(), isNudgeNotificationsEnabled);

		userSettings.setNotifications(notificationsObjectNode);
		userSettings.setUser(user);

		log.info("createNotificationSettings: execution ended");
		return userSettings;
	}

	private void validateUserEmail(String workEmail, List<String> errors) {
		if (workEmail != null && (workEmail.matches(Validation.EMAIL_REGEX))) {
			Optional<User> userBulkDtoUser = userDao.findByEmail(workEmail);
			if (userBulkDtoUser.isPresent()) {
				errors.add(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_USER_EMAIL_ALREADY_EXIST));
			}
		}
		else {
			errors.add(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_INVALID_EMAIL));
		}

		if (workEmail != null && workEmail.length() > PeopleConstants.MAX_EMAIL_LENGTH)
			errors.add(messageUtil.getMessage(CommonMessageConstant.COMMON_ERROR_VALIDATION_EMAIL_LENGTH,
					new Object[] { PeopleConstants.MAX_EMAIL_LENGTH }));

		if (workEmail != null) {
			try {
				enterpriseValidations(workEmail);
			}
			catch (Exception e) {
				errors.add(e.getMessage());
			}
		}
	}

	private void validateUserSupervisor(String supervisorEmail, List<String> errors) {
		if (supervisorEmail != null) {
			Optional<User> managerUser = userDao.findByEmail(supervisorEmail);
			if (managerUser.isEmpty()) {
				errors.add(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_SUPERVISOR_NOT_FOUND));
			}
			else {
				if (Boolean.FALSE.equals(managerUser.get().getEmployee().getUser().getIsActive()))
					errors.add(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_SUPERVISOR_NOT_FOUND));
				else {
					Optional<Employee> primaryManagerEmployee = employeeDao.findById(managerUser.get().getUserId());
					if (primaryManagerEmployee.isEmpty()) {
						errors.add(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_SUPERVISOR_NOT_FOUND));
					}
				}
			}
		}
	}

	private void validateCareerProgressionInBulk(EmployeeProgressionsDto employeeProgressionsDto, List<String> errors) {
		if (employeeProgressionsDto != null) {
			if (employeeProgressionsDto.getJobFamilyId() != null) {
				Optional<JobFamily> jobRole = jobFamilyDao
					.findByJobFamilyIdAndIsActive(employeeProgressionsDto.getJobFamilyId(), true);
				if (jobRole.isEmpty()) {
					errors.add(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_JOB_FAMILY_NOT_FOUND));
				}
			}
			if (employeeProgressionsDto.getJobTitleId() != null) {
				Optional<JobTitle> jobLevel = jobTitleDao
					.findByJobTitleIdAndIsActive(employeeProgressionsDto.getJobTitleId(), true);
				if (jobLevel.isEmpty()) {
					errors.add(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_JOB_TITLE_NOT_FOUND));
				}
			}
			if (employeeProgressionsDto.getStartDate() != null && employeeProgressionsDto.getEndDate() != null
					&& DateTimeUtils.isValidDateRange(employeeProgressionsDto.getStartDate(),
							employeeProgressionsDto.getEndDate())) {
				errors.add(messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_INVALID_START_END_DATE));
			}
		}
	}

	private Set<EmployeeManager> addNewManagers(EmployeeDetailsDto employeeDetailsDto, Employee finalEmployee) {
		Set<EmployeeManager> employeeManagers = new HashSet<>();

		if (employeeDetailsDto.getPrimaryManager() != null) {
			Employee manager = getManager(employeeDetailsDto.getPrimaryManager());

			if (manager != null) {
				addManagersToEmployee(manager, finalEmployee, employeeManagers, true);
			}

			if (employeeDetailsDto.getSecondaryManager() != null) {
				Employee secondaryManager = getManager(employeeDetailsDto.getSecondaryManager());
				if (manager != null && manager.equals(secondaryManager)) {
					throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_SECONDARY_MANAGER_DUPLICATE);
				}
				addManagersToEmployee(secondaryManager, finalEmployee, employeeManagers, false);
			}
		}

		return employeeManagers;
	}

	private void addManagersToEmployee(Employee manager, Employee finalEmployee, Set<EmployeeManager> employeeManagers,
			boolean directManager) {
		EmployeeManager employeeManager = createEmployeeManager(manager, finalEmployee, directManager);
		employeeManagers.add(employeeManager);
	}

	private Employee getManager(Long managerId) {
		return employeeDao.findEmployeeByEmployeeIdAndUserActiveNot(managerId, false)
			.orElseThrow(() -> new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_MANAGER_NOT_FOUND));
	}

	private EmployeeManager createEmployeeManager(Employee manager, Employee employee, boolean directManager) {
		EmployeeManager employeeManager = new EmployeeManager();
		employeeManager.setManager(manager);
		employeeManager.setEmployee(employee);
		employeeManager.setIsPrimaryManager(directManager);
		employeeManager.setManagerType(directManager ? ManagerType.PRIMARY : ManagerType.SECONDARY);
		return employeeManager;
	}

	private void saveEmployeePeriod(Employee finalEmployee, ProbationPeriodDto probationPeriodDto) {
		EmployeePeriod employeePeriod = new EmployeePeriod();
		employeePeriod.setEmployee(finalEmployee);
		employeePeriod.setStartDate(probationPeriodDto.getStartDate());
		employeePeriod.setEndDate(probationPeriodDto.getEndDate());
		employeePeriod.setIsActive(true);
		employeePeriodDao.save(employeePeriod);
	}

	private Set<EmployeeTeam> getEmployeeTeamsByName(Set<String> teamName, Employee finalEmployee) {
		List<Team> teams = teamDao.findAllByTeamNameIn(teamName);

		if (teamName.size() != teams.size()) {
			log.info("addNewEmployee: Team ID(s) are not valid");
		}

		Set<EmployeeTeam> employeeTeams;
		if (!teams.isEmpty()) {
			employeeTeams = teams.parallelStream().map(team -> {
				EmployeeTeam employeeTeam = new EmployeeTeam();
				employeeTeam.setTeam(team);
				employeeTeam.setEmployee(finalEmployee);
				employeeTeam.setIsSupervisor(false);
				return employeeTeam;
			}).collect(Collectors.toSet());
		}
		else {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_TEAM_NOT_FOUND);
		}
		return employeeTeams;
	}

	private List<String> validateEmployeeBulkDto(EmployeeBulkDto employeeBulkDto) {
		List<String> errors = new ArrayList<>();

		validateMandatoryFields(employeeBulkDto);

		if (employeeBulkDto.getTimeZone() != null && !employeeBulkDto.getTimeZone().isBlank()
				&& !DateTimeUtils.isValidTimeZone(employeeBulkDto.getTimeZone())) {
			throw new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_INVALID_TIMEZONE);
		}

		if (employeeBulkDto.getIdentificationNo() != null)
			validateIdentificationNo(employeeBulkDto.getIdentificationNo(), errors);

		validateFirstName(employeeBulkDto.getFirstName(), errors);
		validateLastName(employeeBulkDto.getLastName(), errors);
		validateUserEmail(employeeBulkDto.getWorkEmail(), errors);
		validateUserSupervisor(employeeBulkDto.getPrimaryManager(), errors);
		validateCareerProgressionInBulk(employeeBulkDto.getEmployeeProgression(), errors);
		validateStateInBulk(employeeBulkDto.getEmployeePersonalInfo().getState(), errors);

		if (employeeBulkDto.getEmployeeEmergency() != null) {
			validateEmergencyContactName(employeeBulkDto.getEmployeeEmergency().getName(), errors);
			validatePhoneNumberInBulk(employeeBulkDto.getEmployeeEmergency().getContactNo(), errors);
		}
		if (employeeBulkDto.getPhone() != null)
			validatePhoneNumberInBulk(employeeBulkDto.getPhone(), errors);
		if (employeeBulkDto.getEmployeeEmergency() != null
				&& employeeBulkDto.getEmployeeEmergency().getContactNo() != null)
			validateEmergencyContactNumberInBulk(employeeBulkDto.getEmployeeEmergency().getContactNo(), errors);
		if (employeeBulkDto.getEmployeePersonalInfo().getNin() != null)
			validateNIN(employeeBulkDto.getEmployeePersonalInfo().getNin(), errors);
		if (employeeBulkDto.getAddress() != null)
			validateAddressInBulk(employeeBulkDto.getAddress(), errors);
		if (employeeBulkDto.getAddressLine2() != null)
			validateAddressInBulk(employeeBulkDto.getAddressLine2(), errors);
		validateCityInBulk(employeeBulkDto.getEmployeePersonalInfo().getCity(), errors);
		validatePassportNumber(employeeBulkDto.getEmployeePersonalInfo().getPassportNo(), errors);
		if (employeeBulkDto.getEmployeePersonalInfo().getSsn() != null) {
			validateSocialSecurityNumber(employeeBulkDto.getEmployeePersonalInfo().getSsn(), errors);
		}

		return errors;
	}

	private List<EmployeeBulkDto> getOverFlowedEmployeeBulkDtoList(List<EmployeeBulkDto> employeeBulkDtoList,
			List<EmployeeBulkDto> validList) {
		return employeeBulkDtoList.stream().filter(e -> !validList.contains(e)).toList();
	}

	private List<CompletableFuture<Void>> createEmployeeTasks(List<EmployeeBulkDto> employeeBulkDtoList,
			ExecutorService executorService, List<EmployeeBulkResponseDto> results) {
		List<CompletableFuture<Void>> tasks = new ArrayList<>();
		List<List<EmployeeBulkDto>> chunkedEmployeeBulkData = CommonModuleUtils.chunkData(employeeBulkDtoList);
		TransactionTemplate transactionTemplate = getTransactionManagerTemplate();

		String tenant = bulkContextService.getContext();

		for (List<EmployeeBulkDto> employeeBulkChunkDtoList : chunkedEmployeeBulkData) {
			for (EmployeeBulkDto employeeBulkDto : employeeBulkChunkDtoList) {
				tasks.add(createEmployeeTask(employeeBulkDto, transactionTemplate, results, executorService, tenant));
			}
		}

		return tasks;
	}

	private CompletableFuture<Void> createEmployeeTask(EmployeeBulkDto employeeBulkDto,
			TransactionTemplate transactionTemplate, List<EmployeeBulkResponseDto> results,
			ExecutorService executorService, String tenant) {
		return CompletableFuture.runAsync(() -> {
			try {
				bulkContextService.setContext(tenant);
				saveEmployeeInTransaction(employeeBulkDto, transactionTemplate);
				handleSuccessResponse(employeeBulkDto,
						messageUtil.getMessage(PeopleMessageConstant.PEOPLE_SUCCESS_EMPLOYEE_ADDED), results);
			}
			catch (DataIntegrityViolationException e) {
				handleDataIntegrityException(employeeBulkDto, e, results);
			}
			catch (Exception e) {
				handleGeneralException(employeeBulkDto, e, results);
			}
		}, executorService);
	}

	private void saveEmployeeInTransaction(EmployeeBulkDto employeeBulkDto, TransactionTemplate transactionTemplate) {
		transactionTemplate.execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(@NonNull TransactionStatus status) {
				createNewEmployeeFromBulk(employeeBulkDto);
			}
		});
	}

	private void handleSuccessResponse(EmployeeBulkDto employeeBulkDto, String message,
			List<EmployeeBulkResponseDto> results) {
		log.warn("bulk employee added successfully : {}", employeeBulkDto.getWorkEmail());
		EmployeeBulkResponseDto bulkResponseDto = createSuccessResponse(employeeBulkDto, message);
		results.add(bulkResponseDto);
	}

	private void handleDataIntegrityException(EmployeeBulkDto employeeBulkDto, DataIntegrityViolationException e,
			List<EmployeeBulkResponseDto> results) {
		log.warn("addEmployeeBulk: data integrity violation exception occurred when saving : {}", e.getMessage());
		EmployeeBulkResponseDto bulkResponseDto = createErrorResponse(employeeBulkDto, e.getMessage());
		bulkResponseDto.setMessage(e.getMessage().contains("unique")
				? messageUtil.getMessage(PeopleMessageConstant.PEOPLE_ERROR_DUPLICATE_IDENTIFICATION_NO)
				: e.getMessage());
		results.add(bulkResponseDto);
	}

	@Override
	public void updateUserStatus(Long userId, AccountStatus status, boolean isDelete) {
		log.info("updateUserStatus: execution started");

		User user = userDao.findById(userId)
			.orElseThrow(() -> new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_NOT_FOUND));
		Employee employee = user.getEmployee();

		if (status.equals(AccountStatus.ACTIVE) && Boolean.FALSE.equals(user.getIsActive())) {
			employee.setAccountStatus(status);
			user.setIsActive(true);

			updateSubscriptionQuantity(1L, true, false);
			userVersionService.upgradeUserVersion(user.getUserId(), VersionType.MAJOR);
			invalidateUserCache();
			invalidateUserAuthPicCache();
		}

		if (!Boolean.TRUE.equals(user.getIsActive())) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_USER_ACCOUNT_DEACTIVATED);
		}

		if (!teamDao.findTeamsManagedByUser(user.getUserId(), true).isEmpty()) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_TEAM_EMPLOYEE_SUPERVISING_TEAMS);
		}

		if (employeeDao.countEmployeesByPrimaryManagerId(user.getUserId()) > 0) {
			throw new ModuleException(CommonMessageConstant.COMMON_ERROR_EMPLOYEE_SUPERVISING_EMPLOYEES);
		}

		List<EmployeeTeam> employeeTeams = employeeTeamDao.findEmployeeTeamsByEmployee(employee);

		if (!employeeTeams.isEmpty()) {
			employeeTeamDao.deleteAll(employeeTeams);
			employee.setEmployeeTeams(null);
		}

		List<EmployeeManager> employeeManagers = employeeManagerDao.findByManager(employee);
		if (!employeeManagers.isEmpty()) {
			employeeManagerDao.deleteAll(employeeManagers);
			employee.setEmployeeManagers(null);
		}

		employee.setJobTitle(null);
		employee.setJobFamily(null);
		employee.setAccountStatus(status);
		employee.setTerminationDate(DateTimeUtils.getCurrentUtcDate());

		user.setIsActive(false);

		if (isDelete) {
			user.setEmail(DateTimeUtils.concatPrefixWithTimestamp(PeopleConstants.DELETED_PREFIX) + user.getEmail());
		}
		else {
			peopleEmailService.sendUserTerminationEmail(user);
		}

		userDao.save(user);
		applicationEventPublisher.publishEvent(new UserDeactivatedEvent(this, user));

		updateSubscriptionQuantity(1L, false, false);
		userVersionService.upgradeUserVersion(user.getUserId(), VersionType.MAJOR);
		invalidateUserCache();
		invalidateUserAuthPicCache();
	}

}
