package com.skapp.community.peopleplanner.util;

import com.skapp.community.common.constant.CommonMessageConstant;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.Validation;
import com.skapp.community.peopleplanner.constant.PeopleConstants;
import com.skapp.community.peopleplanner.constant.PeopleMessageConstant;
import com.skapp.community.peopleplanner.payload.request.EmployeeDetailsDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeEducationDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeFamilyDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeQuickAddDto;
import com.skapp.community.peopleplanner.payload.request.EmploymentVisaDto;
import com.skapp.community.peopleplanner.payload.request.ProbationPeriodDto;
import lombok.experimental.UtilityClass;

import java.time.LocalDate;
import java.util.List;
import java.util.TimeZone;
import java.util.regex.Pattern;

import static com.skapp.community.common.util.Validation.ADDRESS_REGEX;
import static com.skapp.community.common.util.Validation.ALPHANUMERIC_REGEX;
import static com.skapp.community.common.util.Validation.COUNTRY_CODE_PATTERN;
import static com.skapp.community.common.util.Validation.EMAIL_REGEX;
import static com.skapp.community.common.util.Validation.LETTERS_AND_SPACE_REGEX;
import static com.skapp.community.common.util.Validation.NUMERIC_REGEX;
import static com.skapp.community.common.util.Validation.PHONE_NUMBER_PATTERN;
import static com.skapp.community.common.util.Validation.VALID_IDENTIFICATION_NUMBER_REGEXP;
import static com.skapp.community.common.util.Validation.VALID_NIN_NUMBER_REGEXP;

@UtilityClass
public class Validations {

	public static boolean isValidPhoneNumber(String phoneNumber) {
		boolean isValid = false;
		if (phoneNumber.contains(" ")) {
			String countryCode = phoneNumber.substring(0, phoneNumber.indexOf(" "));
			String num = phoneNumber.substring(phoneNumber.indexOf(" ") + 1);
			if (Pattern.matches(COUNTRY_CODE_PATTERN, countryCode) && Pattern.matches(PHONE_NUMBER_PATTERN, num))
				isValid = true;
		}
		else {
			if (Pattern.matches(PHONE_NUMBER_PATTERN, phoneNumber))
				isValid = true;
		}
		return isValid;
	}

	public static boolean isValidIdentificationNo(String identificationNo) {
		return identificationNo.matches(VALID_IDENTIFICATION_NUMBER_REGEXP);
	}

	public static boolean validateTimeZone(String timeZone) {
		List<String> validIDs = List.of(TimeZone.getAvailableIDs());
		return validIDs.contains(timeZone);
	}

	public static void validateVisaDates(List<EmploymentVisaDto> employeeVisas) {
		LocalDate currentDate = DateTimeUtils.getCurrentUtcDate();
		for (EmploymentVisaDto visa : employeeVisas) {
			if (visa.getIssuedDate() != null && visa.getIssuedDate().isAfter(currentDate)) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_VALIDATION_VISA_ISSUED_DATE);
			}
			if (visa.getExpirationDate() != null && visa.getExpirationDate().isBefore(currentDate)) {
				throw new ModuleException(CommonMessageConstant.COMMON_ERROR_VALIDATION_VISA_EXPIRATION_DATE);
			}
		}
	}

	public static void validateEmployeeDetails(EmployeeDetailsDto employeeDetailsDto) {
		if (employeeDetailsDto.getWorkEmail() == null || employeeDetailsDto.getWorkEmail().isEmpty())
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_EMAIL);
		else
			validateEmail(employeeDetailsDto.getWorkEmail());

		if (employeeDetailsDto.getFirstName() == null || employeeDetailsDto.getFirstName().isEmpty())
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_ENTER_FIRST_NAME);
		else
			validateName(employeeDetailsDto.getFirstName());

		if (employeeDetailsDto.getLastName() == null || employeeDetailsDto.getLastName().isEmpty())
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_ENTER_LAST_NAME);
		else
			validateName(employeeDetailsDto.getLastName());

		if (employeeDetailsDto.getMiddleName() != null && !employeeDetailsDto.getMiddleName().isEmpty())
			validateName(employeeDetailsDto.getMiddleName());

		if (employeeDetailsDto.getPersonalEmail() != null && !employeeDetailsDto.getPersonalEmail().isEmpty())
			validateEmail(employeeDetailsDto.getPersonalEmail());

		if (employeeDetailsDto.getPhone() != null && !employeeDetailsDto.getPhone().isEmpty())
			validateContactNo(employeeDetailsDto.getPhone());

		if (employeeDetailsDto.getAddress() != null && !employeeDetailsDto.getAddress().isEmpty())
			validateAddress(employeeDetailsDto.getAddress());

		if (employeeDetailsDto.getAddressLine2() != null && !employeeDetailsDto.getAddressLine2().isEmpty())
			validateAddress(employeeDetailsDto.getAddressLine2());

		if (employeeDetailsDto.getIdentificationNo() != null && !employeeDetailsDto.getIdentificationNo().isEmpty())
			validateEmployeeIdentificationNo(employeeDetailsDto.getIdentificationNo());

		if (employeeDetailsDto.getJoinDate() != null)
			validateJoinedDate(employeeDetailsDto.getJoinDate());

		if (employeeDetailsDto.getJoinDate() != null && employeeDetailsDto.getEmployeePeriod() != null)
			validateStartAndJoinedDates(employeeDetailsDto.getJoinDate(),
					employeeDetailsDto.getEmployeePeriod().getStartDate());

		if (employeeDetailsDto.getEmployeePeriod() != null)
			validateEmployeePeriod(employeeDetailsDto.getEmployeePeriod());

		if (employeeDetailsDto.getEmployeePersonalInfo() != null
				&& employeeDetailsDto.getEmployeePersonalInfo().getBirthDate() != null)
			validateBirthDate(employeeDetailsDto.getEmployeePersonalInfo().getBirthDate());

		if (employeeDetailsDto.getEmployeePersonalInfo() != null
				&& employeeDetailsDto.getEmployeePersonalInfo().getNin().isEmpty())
			validateNIN(employeeDetailsDto.getEmployeePersonalInfo().getNin());

		if (employeeDetailsDto.getEmployeeEducations() != null && !employeeDetailsDto.getEmployeeEducations().isEmpty())
			validateEducationDetails(employeeDetailsDto.getEmployeeEducations());

		if (employeeDetailsDto.getEmployeeFamilies() != null && !employeeDetailsDto.getEmployeeFamilies().isEmpty())
			validateFamilyDetails(employeeDetailsDto.getEmployeeFamilies());

		if (employeeDetailsDto.getEmployeeVisas() != null && !employeeDetailsDto.getEmployeeVisas().isEmpty()) {
			validateVisaDates(employeeDetailsDto.getEmployeeVisas());
		}

		if (employeeDetailsDto.getTimeZone() != null && !employeeDetailsDto.getTimeZone().isEmpty()
				&& !validateTimeZone(employeeDetailsDto.getTimeZone())) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_INVALID_TIMEZONE);
		}

		if (employeeDetailsDto.getProbationPeriod() != null
				&& Validation.isInvalidStartAndEndDate(employeeDetailsDto.getProbationPeriod().getStartDate(),
						employeeDetailsDto.getProbationPeriod().getEndDate())) {
			throw new ModuleException(PeopleMessageConstant.PEOPLE_ERROR_INVALID_START_END_DATE);
		}
	}

	public static void validateQuickAddEmployeeDetails(EmployeeQuickAddDto employeeQuickAddDto) {
		if (employeeQuickAddDto.getEmail() == null || employeeQuickAddDto.getEmail().isEmpty())
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_EMAIL);
		else
			validateEmail(employeeQuickAddDto.getEmail());

		if (employeeQuickAddDto.getFirstName() == null || employeeQuickAddDto.getFirstName().isEmpty())
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_ENTER_FIRST_NAME);
		else
			validateName(employeeQuickAddDto.getFirstName());

		if (employeeQuickAddDto.getLastName() == null || employeeQuickAddDto.getLastName().isEmpty())
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_ENTER_LAST_NAME);
		else
			validateName(employeeQuickAddDto.getLastName());
	}

	public static void validateEmail(String email) {
		if (email != null && !email.trim().matches(EMAIL_REGEX))
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_EMAIL);

		if (email != null && email.length() > PeopleConstants.MAX_EMAIL_LENGTH)
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_EMAIL_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_EMAIL_LENGTH)));
	}

	public static void validateWorkEmail(String email) {
		if (email != null && !email.trim().matches(EMAIL_REGEX))
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_WORK_EMAIL);

		if (email != null && email.length() > PeopleConstants.MAX_EMAIL_LENGTH)
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_WORK_EMAIL_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_EMAIL_LENGTH)));
	}

	public static void validatePersonalEmail(String email) {
		if (email != null && !email.trim().matches(EMAIL_REGEX))
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_PERSONAL_EMAIL);

		if (email != null && email.length() > PeopleConstants.MAX_EMAIL_LENGTH)
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_PERSONAL_EMAIL_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_EMAIL_LENGTH)));
	}

	public static void validateName(String name) {
		if (name != null && name.length() > PeopleConstants.MAX_NAME_LENGTH)
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_NAME_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_NAME_LENGTH)));
	}

	public static void validateFirstName(String name) {
		if (name != null && name.length() > PeopleConstants.MAX_NAME_LENGTH)
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_FIRST_NAME_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_NAME_LENGTH)));
	}

	public static void validateLastName(String name) {
		if (name != null && name.length() > PeopleConstants.MAX_NAME_LENGTH)
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_LAST_NAME_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_NAME_LENGTH)));
	}

	public static void validateMiddleName(String name) {
		if (name != null && name.length() > PeopleConstants.MAX_NAME_LENGTH)
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_MIDDLE_NAME_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_NAME_LENGTH)));
	}

	public static void validateFamilyFirstName(String name) {
		if (name != null && name.length() > PeopleConstants.MAX_NAME_LENGTH)
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_FAMILY_FIRST_NAME_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_NAME_LENGTH)));
	}

	public static void validateFamilyLastName(String name) {
		if (name != null && name.length() > PeopleConstants.MAX_NAME_LENGTH)
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_FAMILY_LAST_NAME_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_NAME_LENGTH)));
	}

	public static void validateFamilyParentName(String name) {
		if (name != null && !name.trim().matches(LETTERS_AND_SPACE_REGEX))
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_FAMILY_PARENT_NAME);

		if (name != null && name.length() > PeopleConstants.MAX_NAME_LENGTH)
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_FAMILY_PARENT_NAME_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_NAME_LENGTH)));
	}

	public static void validateCountry(String country) {
		if (country != null && !country.trim().matches(LETTERS_AND_SPACE_REGEX))
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_COUNTRY);
	}

	public static void validateCity(String city) {
		if (city != null && !city.trim().matches(ADDRESS_REGEX))
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_CITY);
	}

	public static void validateState(String state) {
		if (state != null && !state.trim().matches(ADDRESS_REGEX))
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_STATE);
	}

	public static void validatePostalCode(String country) {
		if (country != null && !country.trim().matches(NUMERIC_REGEX))
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_POSTAL_CODE);
	}

	public static void validateAddress(String addressLine) {
		if (!addressLine.trim().matches(ADDRESS_REGEX))
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_ADDRESS);

		if (addressLine.length() > PeopleConstants.MAX_ADDRESS_LENGTH)
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_ADDRESS_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_ADDRESS_LENGTH)));
	}

	public static void validateAddressLine1(String addressLine) {
		if (!addressLine.trim().matches(ADDRESS_REGEX))
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_ADDRESS_LINE1);

		if (addressLine.length() > PeopleConstants.MAX_ADDRESS_LENGTH)
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_ADDRESS_LINE1_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_ADDRESS_LENGTH)));

	}

	public static void validateAddressLine2(String addressLine) {
		if (!addressLine.trim().matches(ADDRESS_REGEX))
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_ADDRESS_LINE12);

		if (addressLine.length() > PeopleConstants.MAX_ADDRESS_LENGTH)
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_ADDRESS_LINE2_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_ADDRESS_LENGTH)));

	}

	public static void validateContactNo(String phone) {
		if (!phone.trim().matches(PHONE_NUMBER_PATTERN))
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_PHONE_NUMBER);

		if (phone.length() > PeopleConstants.MAX_PHONE_LENGTH)
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_PHONE_NUMBER_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_PHONE_LENGTH)));
	}

	public static void validateEmployeeContactNo(String phone) {
		if (!phone.trim().matches(PHONE_NUMBER_PATTERN))
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_EMPLOYEE_PHONE_NUMBER);

		if (phone.length() > PeopleConstants.MAX_PHONE_LENGTH)
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_EMPLOYEE_PHONE_NUMBER_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_PHONE_LENGTH)));
	}

	public static void validateEmployeeIdentificationNo(String identificationNo) {
		if (!identificationNo.matches(VALID_IDENTIFICATION_NUMBER_REGEXP))
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_IDENTIFICATION_NUMBER);

		if (identificationNo.length() > PeopleConstants.MAX_ID_LENGTH)
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_IDENTIFICATION_NUMBER_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_ID_LENGTH)));

	}

	public static void validateNIN(String nin) {
		if (!nin.trim().matches(VALID_NIN_NUMBER_REGEXP))
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_NIN);

		if (nin.length() > PeopleConstants.MAX_NIN_LENGTH)
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_NIN_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_NIN_LENGTH)));
	}

	public static void validateJoinedDate(LocalDate joinDate) {
		if (joinDate.isAfter(LocalDate.now()))
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_JOIN_DATE);
	}

	public static void validateEmployeePeriod(ProbationPeriodDto employeePeriod) {
		if (employeePeriod.getStartDate().isAfter(LocalDate.now()))
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_START_DATE);

		if (employeePeriod.getEndDate().isBefore(employeePeriod.getStartDate()))
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_END_DATE);
	}

	public static void validateStartAndJoinedDates(LocalDate startDate, LocalDate joinDate) {
		if (startDate.isAfter(joinDate))
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_START_DATE_JOIN_DATE);
	}

	public static void validateBirthDate(LocalDate birthDate) {
		if (!birthDate.isBefore(LocalDate.now()))
			throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_BIRTH_DATE);
	}

	public static void validateEducationDetails(List<EmployeeEducationDto> employeeEducations) {
		for (EmployeeEducationDto education : employeeEducations) {
			if (education.getInstitution().length() > PeopleConstants.MAX_EDUCATIONAL_DETAILS_LENGTH)
				throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_ENTER_INSTITUTION);

			if (education.getDegree().length() > PeopleConstants.MAX_EDUCATIONAL_DETAILS_LENGTH)
				throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_ENTER_DEGREE);

			if (education.getSpecialization().length() > PeopleConstants.MAX_EDUCATIONAL_DETAILS_LENGTH)
				throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_ENTER_SPECIALIZATION);

			if (education.getStartDate() != null && education.getEndDate() != null
					&& !education.getStartDate().isBefore(education.getEndDate()))
				throw new ValidationException(CommonMessageConstant.COMMON_ERROR_VALIDATION_START_DATE_END_DATE);
		}
	}

	public static void validateFamilyDetails(List<EmployeeFamilyDto> employeeFamily) {
		for (EmployeeFamilyDto family : employeeFamily) {
			if (!family.getFirstName().isEmpty())
				validateName(family.getFirstName());

			if (!family.getLastName().isEmpty())
				validateName(family.getLastName());

			if (!family.getParentName().isEmpty())
				validateName(family.getParentName());

			if (family.getBirthDate() != null)
				validateBirthDate(family.getBirthDate());
		}
	}

	public static void validateEmployeeNumber(String employeeNumber) {
		if (!employeeNumber.trim().matches(ALPHANUMERIC_REGEX))
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_EMPLOYEE_NUMBER);

		if (employeeNumber.length() > PeopleConstants.MAX_EMPLOYEE_NUMBER_LENGTH)
			throw new ValidationException(PeopleMessageConstant.PEOPLE_ERROR_VALIDATION_EMPLOYEE_NUMBER_LENGTH,
					List.of(String.valueOf(PeopleConstants.MAX_EMPLOYEE_NUMBER_LENGTH)));
	}

}
