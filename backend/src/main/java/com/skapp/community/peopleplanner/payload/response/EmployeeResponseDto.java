package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.common.type.EmployeeUserRole;
import com.skapp.community.peopleplanner.payload.request.EmployeeEducationDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeEmergencyDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeFamilyDto;
import com.skapp.community.peopleplanner.payload.request.EmployeePersonalInfoDto;
import com.skapp.community.peopleplanner.payload.request.EmploymentVisaDto;
import com.skapp.community.peopleplanner.payload.request.JobFamilyDto;
import com.skapp.community.peopleplanner.payload.request.JobTitleDto;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.EEO;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.community.peopleplanner.type.Ethnicity;
import com.skapp.community.peopleplanner.type.Gender;
import com.skapp.community.peopleplanner.type.Title;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EmployeeResponseDto {

	private Long employeeId;

	private String firstName;

	private String lastName;

	private String middleName;

	private String address;

	private String addressLine2;

	private String designation;

	private String authPic;

	private String identificationNo;

	private String email;

	private JobTitleDto jobTitle;

	private JobFamilyDto jobFamilyDto;

	private EmployeePeriodResponseDto probationPeriod;

	private EmploymentAllocation employmentAllocation;

	private AccountStatus accountStatus;

	private String country;

	private String personalEmail;

	private String phone;

	private Title title;

	private Gender gender;

	private List<EmployeeProgressionResponseDto> employeeProgressions;

	private EEO eeo;

	private Ethnicity ethnicity;

	private List<TeamEmployeeResponseDto> teams;

	private List<EmploymentVisaDto> employeeVisas;

	private List<EmployeeEmergencyDto> employeeEmergencies;

	private EmployeePersonalInfoDto employeePersonalInfo;

	private List<EmployeeEducationDto> employeeEducations;

	private List<EmployeeFamilyDto> employeeFamilies;

	private EmployeeUserRole userRole;

}
