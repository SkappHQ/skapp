package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.EEO;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.community.peopleplanner.type.Gender;
import com.skapp.community.peopleplanner.type.Title;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
public class EmployeeBulkDto {

	private Title title;

	private String identificationNo;

	private String workEmail;

	private String personalEmail;

	private String firstName;

	private String middleName;

	private String lastName;

	private String country;

	private String timeZone;

	private String primaryManager;

	private Set<String> teams;

	private String jobFamily;

	private String jobTitle;

	private String employeeType;

	private Gender gender;

	private String phone;

	private String address;

	private String addressLine2;

	private LocalDate joinedDate;

	private EEO eeo;

	private EmployeeBulkPersonalInfoDto employeePersonalInfo;

	private ProbationPeriodDto employeePeriod;

	private EmployeeEmergencyDto employeeEmergency;

	private EmployeeProgressionsDto employeeProgression;

	private AccountStatus accountStatus;

	private EmploymentAllocation employmentAllocation;

	private String workLocation;

}
