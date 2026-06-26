package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.peopleplanner.payload.request.EmployeeEmergencyDto;
import com.skapp.community.peopleplanner.payload.request.JobTitleDto;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.community.peopleplanner.type.Gender;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SummarizedManagerEmployeeDto {

	private String employeeId;

	private String identificationNo;

	private String firstName;

	private String lastName;

	private String middleName;

	private String designation;

	private String authPic;

	private Gender gender;

	private String country;

	private EmployeeJobFamilyDto jobFamily;

	private JobTitleDto jobTitle;

	private String timeZone;

	private String email;

	private SummarizedEmployeePersonalInfoDto personalInfo;

	private EmploymentAllocation employmentAllocation;

	private List<EmployeeEmergencyDto> employeeEmergencies;

	private List<TeamEmployeeResponseDto> teams;

	private List<ManagerDetailResponseDto> employees;

	private AccountStatus accountStatus;

}
