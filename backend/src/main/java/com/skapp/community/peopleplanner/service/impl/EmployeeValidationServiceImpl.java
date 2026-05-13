package com.skapp.community.peopleplanner.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.repository.UserDao;
import com.skapp.community.common.repository.WorkLocationDao;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.model.Employee;
import com.skapp.community.peopleplanner.model.JobFamily;
import com.skapp.community.peopleplanner.model.JobTitle;
import com.skapp.community.peopleplanner.model.Team;
import com.skapp.community.peopleplanner.payload.request.employee.CreateEmployeeRequestDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeeEmploymentDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.EmployeePersonalDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentBasicDetailsManagerDetailsDto;
import com.skapp.community.peopleplanner.payload.request.employee.employment.EmployeeEmploymentCareerProgressionDetailsDto;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.repository.JobFamilyDao;
import com.skapp.community.peopleplanner.repository.TeamDao;
import com.skapp.community.peopleplanner.service.EmployeeValidationService;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.util.Validations;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeValidationServiceImpl implements EmployeeValidationService {

	private final TeamDao teamDao;

	private final EmployeeDao employeeDao;

	private final UserDao userDao;

	private final JobFamilyDao jobFamilyDao;

	private final WorkLocationDao workLocationDao;

	@Override
	public void validateCreateEmployeeRequestEmploymentDetails(EmployeeEmploymentDetailsDto employmentDetailsDto,
			User user) {
		if (employmentDetailsDto != null) {
			if (employmentDetailsDto.getEmploymentDetails() != null) {
				if (employmentDetailsDto.getEmploymentDetails().getEmployeeNumber() != null
						&& !employmentDetailsDto.getEmploymentDetails().getEmployeeNumber().isEmpty()) {
					Validations.validateEmployeeNumber(employmentDetailsDto.getEmploymentDetails().getEmployeeNumber());
				}
				if (employmentDetailsDto.getEmploymentDetails().getTeamIds() != null
						&& employmentDetailsDto.getEmploymentDetails().getTeamIds().length > 0) {
					Set<Long> activeTeamIdSet = teamDao.findAllByIsActive(true)
						.stream()
						.map(Team::getTeamId)
						.collect(Collectors.toSet());

					Set<Long> invalidTeamIds = Arrays.stream(employmentDetailsDto.getEmploymentDetails().getTeamIds())
						.filter(id -> !activeTeamIdSet.contains(id))
						.collect(Collectors.toSet());

					if (!invalidTeamIds.isEmpty()) {
						throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_INVALID_TEAM_IDS,
								List.of(String.valueOf(invalidTeamIds)));
					}
				}

				Validations.validateWorkLocation(employmentDetailsDto.getEmploymentDetails().getWorkLocationId(),
						workLocationDao);

				if (employmentDetailsDto.getEmploymentDetails() != null) {
					// Check if a primary supervisor exists
					if (user.getUserId() == null
							&& employmentDetailsDto.getEmploymentDetails().getPrimarySupervisor() != null
							&& employmentDetailsDto.getEmploymentDetails()
								.getPrimarySupervisor()
								.getEmployeeId() != null) {
						Optional<Employee> primarySupervisor = employeeDao.findById(
								employmentDetailsDto.getEmploymentDetails().getPrimarySupervisor().getEmployeeId());
						if (primarySupervisor.isEmpty()) {
							throw new ValidationException(
									PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_PRIMARY_SUPERVISOR_EMPLOYEE_NOT_FOUND);
						}
					}

					// Check for secondary supervisors without a primary
					if (user.getUserId() == null
							&& (employmentDetailsDto.getEmploymentDetails().getPrimarySupervisor() == null
									|| employmentDetailsDto.getEmploymentDetails()
										.getPrimarySupervisor()
										.getEmployeeId() == null)
							&& employmentDetailsDto.getEmploymentDetails().getOtherSupervisors() != null
							&& !employmentDetailsDto.getEmploymentDetails().getOtherSupervisors().isEmpty()
							&& employmentDetailsDto.getEmploymentDetails()
								.getOtherSupervisors()
								.stream()
								.anyMatch(supervisor -> supervisor.getEmployeeId() != null)) {
						throw new ValidationException(
								PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_CANNOT_ADD_OTHER_SUPERVISORS_WITHOUT_PRIMARY_SUPERVISOR);
					}

					// Check if primary is the same as any secondary
					if (employmentDetailsDto.getEmploymentDetails().getPrimarySupervisor() != null
							&& employmentDetailsDto.getEmploymentDetails()
								.getPrimarySupervisor()
								.getEmployeeId() != null
							&& employmentDetailsDto.getEmploymentDetails().getOtherSupervisors() != null
							&& !employmentDetailsDto.getEmploymentDetails().getOtherSupervisors().isEmpty()
							&& employmentDetailsDto.getEmploymentDetails()
								.getOtherSupervisors()
								.stream()
								.anyMatch(supervisor -> supervisor.getEmployeeId() != null
										&& Objects.equals(employmentDetailsDto.getEmploymentDetails()
											.getPrimarySupervisor()
											.getEmployeeId(), supervisor.getEmployeeId()))) {
						throw new ValidationException(
								PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_PRIMARY_OTHER_SUPERVISORS_SAME);
					}

					// Check if all secondary supervisors exist
					if (employmentDetailsDto.getEmploymentDetails().getOtherSupervisors() != null
							&& !employmentDetailsDto.getEmploymentDetails().getOtherSupervisors().isEmpty()) {
						for (EmployeeEmploymentBasicDetailsManagerDetailsDto supervisor : employmentDetailsDto
							.getEmploymentDetails()
							.getOtherSupervisors()) {
							if (supervisor.getEmployeeId() != null) {
								Optional<Employee> secondarySupervisor = employeeDao
									.findById(supervisor.getEmployeeId());
								if (secondarySupervisor.isEmpty()) {
									throw new ValidationException(
											PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_OTHER_SUPERVISORS_EMPLOYEE_NOT_FOUND);
								}
							}
						}
					}

					LocalDate joinedDate = employmentDetailsDto.getEmploymentDetails().getJoinedDate();
					LocalDate probationStartDate = employmentDetailsDto.getEmploymentDetails().getProbationStartDate();
					LocalDate probationEndDate = employmentDetailsDto.getEmploymentDetails().getProbationEndDate();

					if (joinedDate != null && probationStartDate != null && probationStartDate.isBefore(joinedDate)) {
						throw new ValidationException(
								PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_PROBATION_START_DATE_BEFORE_JOINED_DATE);
					}

					if (probationStartDate != null && probationEndDate != null
							&& probationEndDate.isBefore(probationStartDate)) {
						throw new ValidationException(
								PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_PROBATION_END_DATE_BEFORE_START_DATE);
					}

					if (joinedDate != null && probationEndDate != null && probationEndDate.isBefore(joinedDate)) {
						throw new ValidationException(
								PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_PROBATION_END_DATE_BEFORE_JOINED_DATE);
					}
				}
			}

			if (employmentDetailsDto.getCareerProgression() != null
					&& !employmentDetailsDto.getCareerProgression().isEmpty()) {
				boolean isCreateRequest = user.getEmployee() == null;

				long currentEmploymentCount = employmentDetailsDto.getCareerProgression()
					.stream()
					.filter(p -> Boolean.TRUE.equals(p.getIsCurrentEmployment()))
					.count();

				if (currentEmploymentCount > 1) {
					throw new ValidationException(
							PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_ONLY_ONE_CURRENT_EMPLOYMENT_ALLOWED);
				}

				employmentDetailsDto.getCareerProgression().forEach(progression -> {
					if (isCreateRequest) {
						validateCreateCareerProgression(progression);
					}
					else {
						if (progression.getProgressionId() == null) {
							validateCreateCareerProgression(progression);
						}
						else {
							validateExistingProgressionUpdate(progression, user.getEmployee());
						}
					}
				});
			}
		}
	}

	@Override
	public void validateCreateEmployeeRequestRequiredFields(CreateEmployeeRequestDto createEmployeeRequestDto,
			User user) {
		if (user.getEmail() == null
				&& (createEmployeeRequestDto == null || createEmployeeRequestDto.getEmployment() == null
						|| createEmployeeRequestDto.getEmployment().getEmploymentDetails() == null
						|| createEmployeeRequestDto.getEmployment().getEmploymentDetails().getEmail() == null
						|| createEmployeeRequestDto.getEmployment().getEmploymentDetails().getEmail().isEmpty())) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_EMAIL_REQUIRED);
		}

		if ((user.getEmail() != null && user.getEmployee() != null
				&& user.getEmployee().getAccountStatus() != AccountStatus.PENDING)
				&& createEmployeeRequestDto.getEmployment() != null
				&& createEmployeeRequestDto.getEmployment().getEmploymentDetails() != null
				&& createEmployeeRequestDto.getEmployment().getEmploymentDetails().getEmail() != null) {
			throw new ValidationException(
					PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_CANNOT_CHANGE_ACTIVE_USER_EMAIL);
		}

		if (createEmployeeRequestDto.getEmployment() != null
				&& createEmployeeRequestDto.getEmployment().getEmploymentDetails() != null
				&& createEmployeeRequestDto.getEmployment().getEmploymentDetails().getEmail() != null) {
			userDao.findByEmail(createEmployeeRequestDto.getEmployment().getEmploymentDetails().getEmail())
				.ifPresent(u -> {
					throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_USER_EMAIL_ALREADY_EXIST);
				});

			Validations.validateWorkEmail(createEmployeeRequestDto.getEmployment().getEmploymentDetails().getEmail());
		}

		if ((user.getEmployee() == null || user.getEmployee().getFirstName() == null)
				&& (createEmployeeRequestDto.getPersonal() == null
						|| createEmployeeRequestDto.getPersonal().getGeneral() == null
						|| createEmployeeRequestDto.getPersonal().getGeneral().getFirstName() == null
						|| createEmployeeRequestDto.getPersonal().getGeneral().getFirstName().isEmpty())) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_FIRST_NAME_REQUIRED);
		}

		if (createEmployeeRequestDto.getPersonal() != null
				&& createEmployeeRequestDto.getPersonal().getGeneral() != null) {
			Validations.validateFirstName(createEmployeeRequestDto.getPersonal().getGeneral().getFirstName());
		}

		if ((user.getEmployee() == null || user.getEmployee().getFirstName() == null)
				&& (createEmployeeRequestDto.getPersonal() == null
						|| createEmployeeRequestDto.getPersonal().getGeneral() == null
						|| createEmployeeRequestDto.getPersonal().getGeneral().getLastName() == null
						|| createEmployeeRequestDto.getPersonal().getGeneral().getLastName().isEmpty())) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_LAST_NAME_REQUIRED);
		}

		if (createEmployeeRequestDto.getPersonal() != null
				&& createEmployeeRequestDto.getPersonal().getGeneral() != null) {
			Validations.validateLastName(createEmployeeRequestDto.getPersonal().getGeneral().getLastName());
		}
	}

	@Override
	public void validateCreateEmployeeRequestPersonalDetails(EmployeePersonalDetailsDto employeePersonalDetailsDto,
			User user) {
		if (employeePersonalDetailsDto != null) {
			if (employeePersonalDetailsDto.getGeneral() != null) {
				if (employeePersonalDetailsDto.getGeneral().getMiddleName() != null
						&& !employeePersonalDetailsDto.getGeneral().getMiddleName().isEmpty()) {
					Validations.validateMiddleName(employeePersonalDetailsDto.getGeneral().getMiddleName());
				}

				if (employeePersonalDetailsDto.getGeneral().getNin() != null
						&& !employeePersonalDetailsDto.getGeneral().getNin().isEmpty()) {
					Validations.validateNIN(employeePersonalDetailsDto.getGeneral().getNin());
				}

				if (employeePersonalDetailsDto.getGeneral().getDateOfBirth() != null
						&& employeePersonalDetailsDto.getGeneral().getDateOfBirth().isAfter(LocalDate.now())) {
					throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_DOB_FUTURE_DATE);
				}
			}

			if (employeePersonalDetailsDto.getContact() != null) {
				if (employeePersonalDetailsDto.getContact().getPersonalEmail() != null
						&& !employeePersonalDetailsDto.getContact().getPersonalEmail().isEmpty()) {
					Validations.validatePersonalEmail(employeePersonalDetailsDto.getContact().getPersonalEmail());
				}

				if (employeePersonalDetailsDto.getContact().getContactNo() != null
						&& !employeePersonalDetailsDto.getContact().getContactNo().isEmpty()) {
					Validations.validateEmployeeContactNo(employeePersonalDetailsDto.getContact().getContactNo());
				}

				if (employeePersonalDetailsDto.getContact().getAddressLine1() != null
						&& !employeePersonalDetailsDto.getContact().getAddressLine1().isEmpty()) {
					Validations.validateAddressLine1(employeePersonalDetailsDto.getContact().getAddressLine1());
				}

				if (employeePersonalDetailsDto.getContact().getAddressLine2() != null
						&& !employeePersonalDetailsDto.getContact().getAddressLine2().isEmpty()) {
					Validations.validateAddressLine2(employeePersonalDetailsDto.getContact().getAddressLine2());
				}

				if (employeePersonalDetailsDto.getContact().getCountry() != null
						&& !employeePersonalDetailsDto.getContact().getCountry().isEmpty()) {
					Validations.validateCountry(employeePersonalDetailsDto.getContact().getCountry());
				}

				if (employeePersonalDetailsDto.getContact().getCity() != null
						&& !employeePersonalDetailsDto.getContact().getCity().isEmpty()) {
					Validations.validateCity(employeePersonalDetailsDto.getContact().getCity());
				}

				if (employeePersonalDetailsDto.getContact().getState() != null
						&& !employeePersonalDetailsDto.getContact().getState().isEmpty()) {
					Validations.validateState(employeePersonalDetailsDto.getContact().getState());
				}

				if (employeePersonalDetailsDto.getContact().getPostalCode() != null
						&& !employeePersonalDetailsDto.getContact().getPostalCode().isEmpty()) {
					Validations.validatePostalCode(employeePersonalDetailsDto.getContact().getPostalCode());
				}
			}

			if (employeePersonalDetailsDto.getFamily() != null && !employeePersonalDetailsDto.getFamily().isEmpty()) {
				employeePersonalDetailsDto.getFamily().forEach(familyDto -> {
					if (familyDto.getFirstName() != null && !familyDto.getFirstName().isEmpty()) {
						Validations.validateFamilyFirstName(familyDto.getFirstName());
					}
					if (familyDto.getLastName() != null && !familyDto.getLastName().isEmpty()) {
						Validations.validateFamilyLastName(familyDto.getLastName());
					}
					if (familyDto.getParentName() != null && !familyDto.getParentName().isEmpty()) {
						Validations.validateFamilyParentName(familyDto.getParentName());
					}
					if (familyDto.getDateOfBirth() != null && familyDto.getDateOfBirth().isAfter(LocalDate.now())) {
						throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_FAMILY_DOB_FUTURE_DATE);
					}
				});
			}

			if (employeePersonalDetailsDto.getEducational() != null
					&& !employeePersonalDetailsDto.getEducational().isEmpty()) {
				employeePersonalDetailsDto.getEducational().forEach(educationDto -> {
					if (educationDto.getStartDate() != null && educationDto.getEndDate() != null
							&& educationDto.getStartDate().isAfter(educationDto.getEndDate())) {
						throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_EDUCATION_START_END_DATE);
					}
				});
			}
		}
	}

	private void validateCreateCareerProgression(EmployeeEmploymentCareerProgressionDetailsDto progression) {
		if (progression.getEmploymentType() == null) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_EMPLOYMENT_TYPE_REQUIRED);
		}

		if (progression.getJobFamilyId() == null) {
			throw new ValidationException(
					PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_CAREER_PROGRESSION_JOB_FAMILY_REQUIRED);
		}

		if (progression.getJobTitleId() == null) {
			throw new ValidationException(
					PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_CAREER_PROGRESSION_JOB_TITLE_REQUIRED);
		}

		if (progression.getStartDate() == null) {
			throw new ValidationException(
					PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_CAREER_PROGRESSION_START_DATE_REQUIRED);
		}

		validateEndDateRules(progression);

		if (Boolean.TRUE.equals(progression.getIsCurrentEmployment())) {
			validateJobFamilyAndTitle(progression);
		}
	}

	private void validateExistingProgressionUpdate(EmployeeEmploymentCareerProgressionDetailsDto progression,
			Employee employee) {
		boolean progressionBelongsToEmployee = false;
		if (employee.getEmployeeProgressions() != null) {
			progressionBelongsToEmployee = employee.getEmployeeProgressions()
				.stream()
				.anyMatch(p -> p.getProgressionId().equals(progression.getProgressionId()));
		}

		if (!progressionBelongsToEmployee) {
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_CAREER_PROGRESSION_NOT_FOUND);
		}

		validateEndDateRules(progression);
	}

	private void validateEndDateRules(EmployeeEmploymentCareerProgressionDetailsDto progression) {
		if (Boolean.FALSE.equals(progression.getIsCurrentEmployment())) {
			if (progression.getEndDate() == null) {
				throw new ValidationException(
						PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_CAREER_PROGRESSION_END_DATE_REQUIRED);
			}

			if (progression.getStartDate() != null && progression.getEndDate().isBefore(progression.getStartDate())) {
				throw new ValidationException(
						PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_CAREER_END_DATE_BEFORE_START_DATE);
			}
		}

		if (Boolean.TRUE.equals(progression.getIsCurrentEmployment()) && progression.getEndDate() != null) {
			throw new ValidationException(
					PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_CAREER_PROGRESSION_END_DATE_NOT_REQUIRED_FOR_CURRENT_EMPLOYMENT_TRUE);
		}
	}

	private void validateJobFamilyAndTitle(EmployeeEmploymentCareerProgressionDetailsDto progression) {
		JobFamily jobFamily = jobFamilyDao.getJobFamilyById(progression.getJobFamilyId());
		if (jobFamily == null) {
			throw new ModuleException(
					PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_CAREER_PROGRESSION_JOB_FAMILY_NOT_EXIST);
		}

		if (progression.getJobTitleId() != null) {
			JobTitle jobTitle = jobFamily.getJobTitles()
				.stream()
				.filter(title -> title.getJobTitleId().equals(progression.getJobTitleId()))
				.findFirst()
				.orElse(null);
			if (jobTitle == null) {
				throw new ModuleException(
						PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_CAREER_PROGRESSION_JOB_TITLE_NOT_EXIST);
			}
		}
	}

}
