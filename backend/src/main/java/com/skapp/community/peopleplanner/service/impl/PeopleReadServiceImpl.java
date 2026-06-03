package com.skapp.community.peopleplanner.service.impl;

import com.skapp.community.common.constant.AuthConstants;
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
import com.skapp.community.peopleplanner.type.EmployeeProfileViewAccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JavaType;
import tools.jackson.databind.json.JsonMapper;

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

	private final JsonMapper objectMapper;

	private final UserService userService;

	@Override
	@Transactional(readOnly = true)
	public ResponseEntityDto getEmployeeById(Long employeeId) {

		Employee employee = employeeDao.findById(employeeId)
			.orElseThrow(() -> new EntityNotFoundException(PeopleMessageConstant.PEOPLE_ERROR_EMPLOYEE_NOT_FOUND));

		EmployeeProfileViewAccessLevel accessLevel = resolveAccessLevel(employeeId);

		CreateEmployeeRequestDto dto = mapEmployeeToDto(employee, accessLevel);

		return new ResponseEntityDto(false, dto);
	}

	private EmployeeProfileViewAccessLevel resolveAccessLevel(Long targetEmployeeId) {
		Set<String> userRoles = userService.getCurrentUserRoles();
		Long currentUserId = userService.getCurrentUser().getUserId();

		if (hasRole(userRoles, Role.SUPER_ADMIN, Role.PEOPLE_ADMIN, Role.PEOPLE_MANAGER)) {
			return EmployeeProfileViewAccessLevel.FULL_ACCESS;
		}

		if (currentUserId != null && currentUserId.equals(targetEmployeeId)) {
			return EmployeeProfileViewAccessLevel.OWN_PROFILE;
		}

		return EmployeeProfileViewAccessLevel.RESTRICTED;
	}

	private boolean hasRole(Set<String> userRoles, Role... roles) {
		for (Role role : roles) {
			if (userRoles.contains(AuthConstants.AUTH_ROLE + role)) {
				return true;
			}
		}
		return false;
	}

	private CreateEmployeeRequestDto mapEmployeeToDto(Employee employee, EmployeeProfileViewAccessLevel accessLevel) {
		CreateEmployeeRequestDto dto = new CreateEmployeeRequestDto();
		dto.setPersonal(mapPersonalDetails(employee, accessLevel));
		if (accessLevel.canSeeSensitiveData()) {
			dto.setEmergency(mapEmergencyDetails(employee));
		}
		dto.setEmployment(mapEmploymentDetails(employee, accessLevel));
		if (accessLevel.canSeeSystemPermissions()) {
			dto.setSystemPermissions(mapSystemPermissions(employee));
		}
		dto.setCommon(mapCommonDetails(employee));
		return dto;
	}

	private EmployeePersonalDetailsDto mapPersonalDetails(Employee employee,
			EmployeeProfileViewAccessLevel accessLevel) {
		EmployeePersonalDetailsDto dto = new EmployeePersonalDetailsDto();
		dto.setGeneral(mapPersonalGeneralDetails(employee, accessLevel));

		if (accessLevel.canSeeSensitiveData()) {
			dto.setContact(mapPersonalContactDetails(employee));

			Optional.ofNullable(employee.getEmployeeFamilies())
				.ifPresent(families -> dto
					.setFamily(families.stream().map(peopleMapper::employeeFamilyToFamilyDetailsDto).toList()));

			Optional.ofNullable(employee.getEmployeeEducations())
				.ifPresent(educations -> dto.setEducational(
						educations.stream().map(peopleMapper::employeeEducationToEducationalDetailsDto).toList()));

			dto.setSocialMedia(mapPersonalSocialMediaDetails(employee));
			dto.setHealthAndOther(mapPersonalHealthAndOtherDetails(employee));
		}

		return dto;
	}

	private EmployeePersonalGeneralDetailsDto mapPersonalGeneralDetails(Employee employee,
			EmployeeProfileViewAccessLevel accessLevel) {
		EmployeePersonalGeneralDetailsDto dto = new EmployeePersonalGeneralDetailsDto();
		dto.setTitle(employee.getTitle());
		dto.setFirstName(employee.getFirstName());
		dto.setMiddleName(employee.getMiddleName());
		dto.setLastName(employee.getLastName());
		dto.setGender(employee.getGender());

		Optional.ofNullable(employee.getPersonalInfo()).ifPresent(personalInfo -> {
			dto.setNationality(personalInfo.getNationality());
			dto.setDateOfBirth(personalInfo.getBirthDate());
			if (accessLevel.canSeeSensitiveData()) {
				dto.setPassportNumber(personalInfo.getPassportNo());
				dto.setMaritalStatus(personalInfo.getMaritalStatus());
				dto.setNin(personalInfo.getNin());
			}
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
			return objectMapper.convertValue(employee.getPersonalInfo().getSocialMediaDetails(),
					EmployeePersonalSocialMediaDetailsDto.class);
		}
		return new EmployeePersonalSocialMediaDetailsDto();
	}

	private EmployeePersonalHealthAndOtherDetailsDto mapPersonalHealthAndOtherDetails(Employee employee) {
		EmployeePersonalHealthAndOtherDetailsDto dto = new EmployeePersonalHealthAndOtherDetailsDto();

		if (employee.getPersonalInfo() != null) {
			EmployeePersonalInfo personalInfo = employee.getPersonalInfo();
			dto.setBloodGroup(personalInfo.getBloodGroup());

			if (personalInfo.getExtraInfo() != null) {
				EmployeeExtraInfoDto extraInfo = objectMapper.convertValue(personalInfo.getExtraInfo(),
						EmployeeExtraInfoDto.class);
				dto.setAllergies(extraInfo.getAllergies());
				dto.setDietaryRestrictions(extraInfo.getDietaryRestrictions());
				dto.setTShirtSize(extraInfo.getTShirtSize());

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

	private EmployeeEmploymentDetailsDto mapEmploymentDetails(Employee employee,
			EmployeeProfileViewAccessLevel accessLevel) {
		EmployeeEmploymentDetailsDto dto = new EmployeeEmploymentDetailsDto();
		dto.setEmploymentDetails(mapEmploymentBasicDetails(employee, accessLevel));

		if (accessLevel.canSeeSensitiveData()) {
			Optional.ofNullable(employee.getEmployeeProgressions())
				.ifPresent(progressions -> dto.setCareerProgression(
						progressions.stream().map(peopleMapper::employeeProgressionToCareerProgressionDto).toList()));

			dto.setIdentificationAndDiversityDetails(mapIdentificationAndDiversityDetails(employee));
			dto.setPreviousEmployment(mapPreviousEmploymentDetails(employee));

			Optional.ofNullable(employee.getEmployeeVisas())
				.ifPresent(visas -> dto
					.setVisaDetails(visas.stream().map(peopleMapper::employeeVisaToVisaDetailsDto).toList()));
		}

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
			JavaType listType = objectMapper.getTypeFactory()
				.constructCollectionType(List.class, EmployeeEmploymentPreviousEmploymentDetailsDto.class);

			return objectMapper.convertValue(employee.getPersonalInfo().getPreviousEmploymentDetails(), listType);
		}
		return new ArrayList<>();
	}

	private EmployeeEmploymentBasicDetailsDto mapEmploymentBasicDetails(Employee employee,
			EmployeeProfileViewAccessLevel accessLevel) {
		EmployeeEmploymentBasicDetailsDto dto = new EmployeeEmploymentBasicDetailsDto();
		dto.setWorkTimeZone(employee.getTimeZone());
		dto.setEmploymentAllocation(employee.getEmploymentAllocation());

		if (accessLevel.canSeeSensitiveData()) {
			dto.setJoinedDate(employee.getJoinDate());
		}

		Optional.ofNullable(employee.getUser()).ifPresent(user -> {
			if (accessLevel.canSeeSensitiveData()) {
				dto.setEmployeeNumber(employee.getIdentificationNo());
			}
			dto.setEmail(user.getEmail());
		});

		Optional.ofNullable(employee.getEmployeeTeams())
			.ifPresent(teams -> dto
				.setTeamIds(teams.stream().map(team -> team.getTeam().getTeamId()).toArray(Long[]::new)));

		if (accessLevel.canSeeSensitiveData() && employee.getEmployeeManagers() != null) {
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

		if (accessLevel.canSeeSensitiveData()) {
			Optional.ofNullable(employee.getEmployeePeriods())
				.flatMap(periods -> periods.stream().findFirst())
				.ifPresent(probation -> {
					dto.setProbationStartDate(probation.getStartDate());
					dto.setProbationEndDate(probation.getEndDate());
				});
		}

		Optional.ofNullable(employee.getWorkLocation())
			.ifPresent(workLocation -> dto.setWorkLocationId(workLocation.getWorkLocationId()));

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
			dto.setInvoiceRole(role.getInvoiceRole());
			dto.setPmRole(role.getPmRole());
			dto.setCrmRole(role.getCrmRole());
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

}
