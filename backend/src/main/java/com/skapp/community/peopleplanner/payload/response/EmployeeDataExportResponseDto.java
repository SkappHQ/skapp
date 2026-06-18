package com.skapp.community.peopleplanner.payload.response;

import com.skapp.community.peopleplanner.payload.request.JobFamilyDto;
import com.skapp.community.peopleplanner.payload.request.JobTitleDto;
import com.skapp.community.peopleplanner.type.EmploymentType;
import com.skapp.community.peopleplanner.type.Gender;
import com.skapp.community.peopleplanner.type.Title;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class EmployeeDataExportResponseDto {

	private Long employeeId;

	private String email;

	private String firstName;

	private String lastName;

	private String designation;

	private String authPic;

	private String country;

	private String personalEmail;

	private String phone;

	private String identificationNo;

	private String timeZone;

	private String address;

	private Integer workHourCapacity;

	private EmploymentType employmentType;

	private Title title;

	private Gender gender;

	private LocalDate joinDate;

	private List<TeamResponseDto> teamResponseDto;

	private JobFamilyDto jobFamily;

	private JobTitleDto jobTitle;

	private Boolean isActive;

	private List<EmployeeResponseDto> managers;

	private EmployeePeriodResponseDto employeePeriod;

}
