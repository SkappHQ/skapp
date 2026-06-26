package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.peopleplanner.payload.request.employee.EmployeeSystemPermissionsDto;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.EEO;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.community.peopleplanner.type.Gender;
import com.skapp.community.peopleplanner.util.deserializer.AccountStatusDeserializer;
import com.skapp.community.peopleplanner.util.deserializer.EeoDeserializer;
import com.skapp.community.peopleplanner.util.deserializer.EmploymentAllocationDeserializer;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;
import tools.jackson.databind.annotation.JsonDeserialize;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Getter
@Setter
public class EmployeeDetailsDto {

	private Long employeeId;

	private String workEmail;

	private String firstName;

	private String lastName;

	private String middleName;

	private String designation;

	private String address;

	private String addressLine2;

	private String authPic;

	private String country;

	private String personalEmail;

	private String phone;

	private String identificationNo;

	private String timeZone;

	private Long primaryManager;

	private Long secondaryManager;

	private Set<Long> informantManagers;

	private Set<Long> teams;

	private Gender gender;

	private LocalDate joinDate;

	private ProbationPeriodDto employeePeriod;

	@JsonDeserialize(using = AccountStatusDeserializer.class)
	private AccountStatus accountStatus;

	@Valid
	private EmployeePersonalInfoDto employeePersonalInfo;

	private List<EmployeeEmergencyDto> employeeEmergency;

	@JsonDeserialize(using = EeoDeserializer.class)
	private EEO eeo;

	private ProbationPeriodDto probationPeriod;

	@JsonDeserialize(using = EmploymentAllocationDeserializer.class)
	private EmploymentAllocation employmentAllocation;

	private List<EmployeeProgressionsDto> employeeProgressions;

	private List<EmploymentVisaDto> employeeVisas;

	private List<EmployeeEducationDto> employeeEducations;

	private List<EmployeeFamilyDto> employeeFamilies;

	private EmployeeSystemPermissionsDto userRoles;

}
