package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.peopleplanner.payload.request.EmployeeEmergencyDto;
import com.skapp.community.peopleplanner.payload.request.EmployeePersonalInfoDto;
import com.skapp.community.peopleplanner.payload.request.JobFamilyDto;
import com.skapp.community.peopleplanner.payload.request.JobTitleDto;
import com.skapp.community.peopleplanner.type.EEO;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.community.peopleplanner.type.EmploymentType;
import com.skapp.community.peopleplanner.type.Gender;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class EmployeeAllDataExportResponseDto {

	private Long employeeId;

	private String employeeNumber;

	private String email;

	private String firstName;

	private String middleName;

	private String lastName;

	private String designation;

	private String authPic;

	private String country;

	private String personalEmail;

	private String phone;

	private String identificationNo;

	private String timeZone;

	private String address;

	private String addressLine1;

	private String addressLine2;

	private Integer workHourCapacity;

	private EmploymentType employmentType;

	private EmploymentAllocation employmentAllocation;

	private EEO eeoJobCategory;

	private Gender gender;

	private LocalDate joinDate;

	private List<TeamResponseDto> teamResponseDto;

	private JobFamilyDto jobFamily;

	private JobTitleDto jobTitle;

	private Boolean isActive;

	private EmployeeResponseDto primarySupervisor;

	private EmployeePeriodResponseDto employeePeriod;

	private EmployeePersonalInfoDto employeePersonalInfoDto;

	private List<EmployeeEmergencyDto> employeeEmergencyDto;

}
