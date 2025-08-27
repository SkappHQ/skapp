package com.skapp.community.peopleplanner.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skapp.community.common.exception.EntityNotFoundException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.Role;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.mapper.PeopleMapper;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.EmployeeEmergency;
import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeePersonalInfo;
import com.skapp.community.peopleplanner.payload.request.employee.CreateEmployeeRequestDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeeCommonDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeeEmergencyDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeeEmploymentDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeePersonalDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeeSystemPermissionsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentBasicDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentIdentificationAndDiversityDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentPreviousEmploymentDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.personal.EmployeeExtraInfoDto;
import com.skapp.community.peopleplanner.payload.request.employee.personal.EmployeePersonalContactDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.personal.EmployeePersonalGeneralDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.personal.EmployeePersonalHealthAndOtherDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.personal.EmployeePersonalSocialMediaDetailsDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.service.PeopleReadService;
import com.skapp.community.peopleplanner.util.FieldExtractor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RequiredArgsConstructor
@Service
@Slf4j
public class PeopleReadServiceImpl implements PeopleReadService {

	private final PeopleMapper peopleMapper;

	private final EmployeeDao employeeDao;

	private final ObjectMapper objectMapper;

	private final UserService userService;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getEmployeeById(Long employeeId) {
		Employee employee = employeeDao.findById(employeeId)
			.orElseThrow(() -> new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND));

		CreateEmployeeRequestDto dto = mapEmployeeToDto(employee);
		applyRoleBasedRestrictions(dto);

		return new ResponseEntityDto(false, dto);
	}

	private CreateEmployeeRequestDto mapEmployeeToDto(Employee employee) {
		CreateEmployeeRequestDto dto = new CreateEmployeeRequestDto();
		dto.setPersonal(mapPersonalDetails(employee));
		dto.setEmergency(mapEmergencyDetails(employee));
		dto.setEmployment(mapEmploymentDetails(employee));
		dto.setSystemPermissions(mapSystemPermissions(employee));
		dto.setCommon(mapCommonDetails(employee));
		return dto;
	}

	private EmployeePersonalDetailsDto mapPersonalDetails(Employee employee) {
		EmployeePersonalDetailsDto dto = new EmployeePersonalDetailsDto();
		dto.setGeneral(mapPersonalGeneralDetails(employee));
		dto.setContact(mapPersonalContactDetails(employee));

		Optional.ofNullable(employee.getEmployeeFamilies())
			.ifPresent(families -> dto
				.setFamily(families.stream().map(peopleMapper::employeeFamilyToFamilyDetailsDto).toList()));

		Optional.ofNullable(employee.getEmployeeEducations())
			.ifPresent(educations -> dto.setEducational(
					educations.stream().map(peopleMapper::employeeEducationToEducationalDetailsDto).toList()));

		dto.setSocialMedia(mapPersonalSocialMediaDetails(employee));
		dto.setHealthAndOther(mapPersonalHealthAndOtherDetails(employee));
		return dto;
	}

	private EmployeePersonalGeneralDetailsDto mapPersonalGeneralDetails(Employee employee) {
		EmployeePersonalGeneralDetailsDto dto = new EmployeePersonalGeneralDetailsDto();
		dto.setFirstName(employee.getFirstName());
		dto.setMiddleName(employee.getMiddleName());
		dto.setLastName(employee.getLastName());
		dto.setGender(employee.getGender());

		Optional.ofNullable(employee.getPersonalInfo()).ifPresent(personalInfo -> {
			dto.setDateOfBirth(personalInfo.getBirthDate());
			dto.setNationality(personalInfo.getNationality());
			dto.setPassportNumber(personalInfo.getPassportNo());
			dto.setMaritalStatus(personalInfo.getMaritalStatus());
			dto.setNin(personalInfo.getNin());
		});

		return dto;
	}

	private EmployeePersonalContactDetailsDto mapPersonalContactDetails(Employee employee) {
		EmployeePersonalContactDetailsDto dto = new EmployeePersonalContactDetailsDto();
		dto.setPersonalEmail(employee.getPersonalEmail());
		dto.setContactNo(employee.getPhone());
		dto.setAddressLine1(employee.getAddressLine1());
		dto.setAddressLine2(employee.getAddressLine2());
		dto.setCountry(employee.getCountry());

		Optional.ofNullable(employee.getPersonalInfo()).ifPresent(personalInfo -> {
			dto.setCity(personalInfo.getCity());
			dto.setState(personalInfo.getState());
			dto.setPostalCode(personalInfo.getPostalCode());
		});

		return dto;
	}

	private EmployeePersonalSocialMediaDetailsDto mapPersonalSocialMediaDetails(Employee employee) {
		if (employee.getPersonalInfo() != null && employee.getPersonalInfo().getSocialMediaDetails() != null) {
			try {
				return objectMapper.treeToValue(employee.getPersonalInfo().getSocialMediaDetails(),
						EmployeePersonalSocialMediaDetailsDto.class);
			}
			catch (JsonProcessingException e) {
				log.error("Error converting social media details JSON to DTO", e);
			}
		}
		return new EmployeePersonalSocialMediaDetailsDto();
	}

	private EmployeePersonalHealthAndOtherDetailsDto mapPersonalHealthAndOtherDetails(Employee employee) {
		EmployeePersonalHealthAndOtherDetailsDto dto = new EmployeePersonalHealthAndOtherDetailsDto();

		if (employee.getPersonalInfo() != null) {
			EmployeePersonalInfo personalInfo = employee.getPersonalInfo();
			dto.setBloodGroup(personalInfo.getBloodGroup());

			if (personalInfo.getExtraInfo() != null) {
				try {
					EmployeeExtraInfoDto extraInfo = objectMapper.treeToValue(personalInfo.getExtraInfo(),
							EmployeeExtraInfoDto.class);
					dto.setAllergies(extraInfo.getAllergies());
					dto.setDietaryRestrictions(extraInfo.getDietaryRestrictions());
					dto.setTShirtSize(extraInfo.getTShirtSize());
				}
				catch (JsonProcessingException e) {
					log.error("Error converting extra info JSON to DTO", e);
				}
			}
		}

		return dto;
	}

	private EmployeeEmergencyDetailsDto mapEmergencyDetails(Employee employee) {
		EmployeeEmergencyDetailsDto dto = new EmployeeEmergencyDetailsDto();

		if (employee.getEmployeeEmergencies() != null && !employee.getEmployeeEmergencies().isEmpty()) {
			List<EmployeeEmergency> emergencies = new ArrayList<>(employee.getEmployeeEmergencies());

			emergencies.stream()
				.filter(EmployeeEmergency::getIsPrimary)
				.findFirst()
				.or(() -> emergencies.isEmpty() ? Optional.empty() : Optional.of(emergencies.getFirst()))
				.ifPresent(e -> dto.setPrimaryEmergencyContact(peopleMapper.employeeEmergencyToEmergencyContactDto(e)));

			emergencies.stream()
				.filter(e -> !e.getIsPrimary())
				.findFirst()
				.ifPresent(
						e -> dto.setSecondaryEmergencyContact(peopleMapper.employeeEmergencyToEmergencyContactDto(e)));
		}

		return dto;
	}

	private EmployeeEmploymentDetailsDto mapEmploymentDetails(Employee employee) {
		EmployeeEmploymentDetailsDto dto = new EmployeeEmploymentDetailsDto();
		dto.setEmploymentDetails(mapEmploymentBasicDetails(employee));

		Optional.ofNullable(employee.getEmployeeProgressions())
			.ifPresent(progressions -> dto.setCareerProgression(
					progressions.stream().map(peopleMapper::employeeProgressionToCareerProgressionDto).toList()));

		dto.setIdentificationAndDiversityDetails(mapIdentificationAndDiversityDetails(employee));
		dto.setPreviousEmployment(mapPreviousEmploymentDetails(employee));

		Optional.ofNullable(employee.getEmployeeVisas())
			.ifPresent(visas -> dto
				.setVisaDetails(visas.stream().map(peopleMapper::employeeVisaToVisaDetailsDto).toList()));

		return dto;
	}

	private EmployeeEmploymentIdentificationAndDiversityDetailsDto mapIdentificationAndDiversityDetails(
			Employee employee) {
		EmployeeEmploymentIdentificationAndDiversityDetailsDto dto = new EmployeeEmploymentIdentificationAndDiversityDetailsDto();

		Optional.ofNullable(employee.getPersonalInfo()).ifPresent(personalInfo -> {
			dto.setSsn(personalInfo.getSsn());
			dto.setEthnicity(personalInfo.getEthnicity());
		});

		dto.setEeoJobCategory(employee.getEeo());

		return dto;
	}

	private List<EmployeeEmploymentPreviousEmploymentDetailsDto> mapPreviousEmploymentDetails(Employee employee) {
		if (employee.getPersonalInfo() != null && employee.getPersonalInfo().getPreviousEmploymentDetails() != null) {
			try {
				return objectMapper.treeToValue(employee.getPersonalInfo().getPreviousEmploymentDetails(),
						new TypeReference<>() {
						});
			}
			catch (JsonProcessingException e) {
				log.error("Error converting previous employment details JSON to DTO", e);
			}
		}
		return new ArrayList<>();
	}

	private EmployeeEmploymentBasicDetailsDto mapEmploymentBasicDetails(Employee employee) {
		EmployeeEmploymentBasicDetailsDto dto = new EmployeeEmploymentBasicDetailsDto();
		dto.setJoinedDate(employee.getJoinDate());
		dto.setWorkTimeZone(employee.getTimeZone());
		dto.setEmploymentAllocation(employee.getEmploymentAllocation());

		Optional.ofNullable(employee.getUser()).ifPresent(user -> {
			dto.setEmployeeNumber(employee.getIdentificationNo());
			dto.setEmail(user.getEmail());
		});

		Optional.ofNullable(employee.getEmployeeTeams())
			.ifPresent(teams -> dto
				.setTeamIds(teams.stream().map(team -> team.getTeam().getTeamId()).toArray(Long[]::new)));

		if (employee.getEmployeeManagers() != null) {
			dto.setPrimarySupervisor(employee.getEmployeeManagers()
				.stream()
				.filter(EmployeeManager::getIsPrimaryManager)
				.findFirst()
				.map(peopleMapper::employeeManagerToManagerDetailsDto)
				.orElse(null));

			dto.setOtherSupervisors(employee.getEmployeeManagers()
				.stream()
				.filter(m -> !m.getIsPrimaryManager())
				.map(peopleMapper::employeeManagerToManagerDetailsDto)
				.toList());
		}

		Optional.ofNullable(employee.getEmployeePeriods())
			.flatMap(periods -> periods.stream().findFirst())
			.ifPresent(probation -> {
				dto.setProbationStartDate(probation.getStartDate());
				dto.setProbationEndDate(probation.getEndDate());
			});

		return dto;
	}

	private EmployeeSystemPermissionsDto mapSystemPermissions(Employee employee) {
		EmployeeSystemPermissionsDto dto = new EmployeeSystemPermissionsDto();

		Optional.ofNullable(employee.getEmployeeRole()).ifPresent(role -> {
			dto.setIsSuperAdmin(role.getIsSuperAdmin());
			dto.setPeopleRole(role.getPeopleRole());
			dto.setLeaveRole(role.getLeaveRole());
			dto.setAttendanceRole(role.getAttendanceRole());
			dto.setEsignRole(role.getEsignRole());
			dto.setOkrRole(role.getOkrRole());
		});

		return dto;
	}

	private EmployeeCommonDetailsDto mapCommonDetails(Employee employee) {
		EmployeeCommonDetailsDto dto = new EmployeeCommonDetailsDto();
		dto.setAccountStatus(employee.getAccountStatus());
		dto.setAuthPic(employee.getAuthPic());
		dto.setEmployeeId(employee.getEmployeeId());
		dto.setJobTitle(employee.getJobTitle() != null ? employee.getJobTitle().getName() : null);
		return dto;
	}

	private void applyRoleBasedRestrictions(CreateEmployeeRequestDto dto) {
		Set<String> userRoles = userService.getCurrentUserRoles();
		Long currentUserId = userService.getCurrentUser().getUserId();
		boolean isCurrentUser = currentUserId != null && dto.getCommon() != null
				&& currentUserId.equals(dto.getCommon().getEmployeeId());

		// From CreateEmployeeRequestDto
		String personalField = field(CreateEmployeeRequestDto::getPersonal);
		String emergencyField = field(CreateEmployeeRequestDto::getEmergency);
		String employmentField = field(CreateEmployeeRequestDto::getEmployment);
		String systemPermissionsField = field(CreateEmployeeRequestDto::getSystemPermissions);

		// Field names from DTOs
		String generalField = field(EmployeePersonalDetailsDto::getGeneral);
		String contactField = field(EmployeePersonalDetailsDto::getContact);
		String familyField = field(EmployeePersonalDetailsDto::getFamily);
		String educationalField = field(EmployeePersonalDetailsDto::getEducational);
		String socialMediaField = field(EmployeePersonalDetailsDto::getSocialMedia);
		String healthAndOtherField = field(EmployeePersonalDetailsDto::getHealthAndOther);

		String ninField = field(EmployeePersonalGeneralDetailsDto::getNin);
		String maritalStatusField = field(EmployeePersonalGeneralDetailsDto::getMaritalStatus);

		String employmentDetailsField = field(EmployeeEmploymentDetailsDto::getEmploymentDetails);
		String careerProgressionField = field(EmployeeEmploymentDetailsDto::getCareerProgression);
		String identificationAndDiversityDetailsField = field(
				EmployeeEmploymentDetailsDto::getIdentificationAndDiversityDetails);
		String previousEmploymentField = field(EmployeeEmploymentDetailsDto::getPreviousEmployment);
		String visaDetailsField = field(EmployeeEmploymentDetailsDto::getVisaDetails);

		String employeeNumberField = field(EmployeeEmploymentBasicDetailsDto::getEmployeeNumber);
		String primarySupervisorField = field(EmployeeEmploymentBasicDetailsDto::getPrimarySupervisor);
		String secondarySupervisorField = field(EmployeeEmploymentBasicDetailsDto::getOtherSupervisors);
		String joinedDateField = field(EmployeeEmploymentBasicDetailsDto::getJoinedDate);
		String probationStartDateField = field(EmployeeEmploymentBasicDetailsDto::getProbationStartDate);
		String probationEndDateField = field(EmployeeEmploymentBasicDetailsDto::getProbationEndDate);

		String personal_contactField = personalField + "_" + contactField;
		String personal_familyField = personalField + "_" + familyField;
		String personal_educationalField = personalField + "_" + educationalField;
		String personal_socialMediaField = personalField + "_" + socialMediaField;
		String personal_healthAndOtherField = personalField + "_" + healthAndOtherField;

		String personal_general_ninField = personalField + "_" + generalField + "_" + ninField;
		String personal_general_maritalStatusField = personalField + "_" + generalField + "_" + maritalStatusField;

		String employment_careerProgressionField = employmentField + "_" + careerProgressionField;
		String employment_identificationAndDiversityDetailsField = employmentField + "_"
				+ identificationAndDiversityDetailsField;
		String employment_previousEmploymentField = employmentField + "_" + previousEmploymentField;
		String employment_visaDetailsField = employmentField + "_" + visaDetailsField;

		String employment_employmentDetails_employeeNumberField = employmentField + "_" + employmentDetailsField + "_"
				+ employeeNumberField;
		String employment_employmentDetails_primarySupervisorField = employmentField + "_" + employmentDetailsField
				+ "_" + primarySupervisorField;
		String employment_employmentDetails_secondarySupervisorField = employmentField + "_" + employmentDetailsField
				+ "_" + secondarySupervisorField;
		String employment_employmentDetails_joinedDateField = employmentField + "_" + employmentDetailsField + "_"
				+ joinedDateField;
		String employment_employmentDetails_probationStartDateField = employmentField + "_" + employmentDetailsField
				+ "_" + probationStartDateField;
		String employment_employmentDetails_probationEndDateField = employmentField + "_" + employmentDetailsField + "_"
				+ probationEndDateField;

		if (!doesNotHaveRole(userRoles, Role.SUPER_ADMIN)) {
			return;
		}

		if (isCurrentUser && doesNotHaveRole(userRoles, Role.PEOPLE_ADMIN, Role.PEOPLE_MANAGER)) {
			setNull(dto, systemPermissionsField);
			return;
		}

		if (doesNotHaveRole(userRoles, Role.PEOPLE_ADMIN) && doesNotHaveRole(userRoles, Role.PEOPLE_MANAGER)) {
			setNull(dto, systemPermissionsField);
			setNull(dto, personal_contactField, personal_familyField, personal_educationalField,
					personal_socialMediaField, personal_healthAndOtherField);
			setNull(dto, employment_careerProgressionField, employment_previousEmploymentField,
					employment_identificationAndDiversityDetailsField, employment_visaDetailsField,
					employment_employmentDetails_employeeNumberField, employment_employmentDetails_joinedDateField,
					employment_employmentDetails_probationStartDateField,
					employment_employmentDetails_probationEndDateField);
			return;
		}

		if ((doesNotHaveRole(userRoles, Role.PEOPLE_ADMIN) && doesNotHaveRole(userRoles, Role.PEOPLE_MANAGER))
				&& (doesNotHaveRole(userRoles, Role.ATTENDANCE_ADMIN) || doesNotHaveRole(userRoles, Role.LEAVE_ADMIN)
						|| doesNotHaveRole(userRoles, Role.ATTENDANCE_MANAGER)
						|| doesNotHaveRole(userRoles, Role.LEAVE_MANAGER))) {
			setNull(dto, systemPermissionsField, emergencyField);
			setNull(dto, personal_contactField, personal_familyField, personal_educationalField,
					personal_socialMediaField, personal_healthAndOtherField);
			setNull(dto, personal_general_maritalStatusField, personal_general_ninField,
					employment_employmentDetails_primarySupervisorField,
					employment_employmentDetails_secondarySupervisorField);
		}
	}

	private <T, R> String field(FieldExtractor.SerializableFunction<T, R> getter) {
		return FieldExtractor.getFieldName(getter);
	}

	private void setNull(Object rootObject, String... fieldNames) {
		if (rootObject == null || fieldNames == null) {
			return;
		}

		for (String fieldName : fieldNames) {
			try {
				Object targetObject = rootObject;
				String targetField = fieldName;

				if (fieldName.contains("_")) {
					String[] parts = fieldName.split("_");
					targetField = parts[parts.length - 1];

					for (int i = 0; i < parts.length - 1; i++) {
						String getterName = "get" + parts[i].substring(0, 1).toUpperCase() + parts[i].substring(1);
						Method getter;
						try {
							getter = targetObject.getClass().getMethod(getterName);
						}
						catch (NoSuchMethodException e) {
							break;
						}

						Object nextObject = getter.invoke(targetObject);
						if (nextObject == null) {
							break;
						}

						targetObject = nextObject;
					}
				}

				String setterName = "set" + targetField.substring(0, 1).toUpperCase() + targetField.substring(1);
				Method setter = findSetter(targetObject.getClass(), setterName);
				if (setter != null) {
					setter.invoke(targetObject, (Object) null);
				}
			}
			catch (Exception e) {
				log.debug("Failed to set field {} to null: {}", fieldName, e.getMessage());
			}
		}
	}

	private Method findSetter(Class<?> clazz, String setterName) {
		Method[] methods = clazz.getMethods();
		for (Method method : methods) {
			if (method.getName().equals(setterName) && method.getParameterCount() == 1) {
				return method;
			}
		}
		return null;
	}

	private boolean doesNotHaveRole(Set<String> userRoles, Role... roles) {
		for (Role role : roles) {
			String roleName = "ROLE_" + role.name();
			if (userRoles.contains(roleName)) {
				return false;
			}
		}
		return true;
	}

}
