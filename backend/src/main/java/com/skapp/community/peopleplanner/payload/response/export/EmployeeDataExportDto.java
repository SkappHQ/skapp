package com.skapp.community.peopleplanner.payload.response.export;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EmployeeDataExportDto {

	private String employeeId;

	private String employeeNumber;

	private String firstName;

	private String middleName;

	private String lastName;

	private String email;

	private String gender;

	private String personalEmail;

	private String phone;

	private String designation;

	private JobTitleExportDto jobTitle;

	private String employmentType;

	private JobFamilyExportDto jobFamily;

	private String joinDate;

	private String timeZone;

	private Integer workHourCapacity;

	private String identificationNo;

	private String addressLine1;

	private String addressLine2;

	private String country;

	private Boolean isActive;

	private String employmentAllocation;

	private EmployeePersonalInfoExportDto employeePersonalInfoDto;

	private List<TeamExportDto> teamResponseDto;

	private ManagerExportDto primarySupervisor;

	private ProbationPeriodExportDto probationPeriod;

	private List<EmergencyContactExportDto> employeeEmergencyDto;

	private String eeoJobCategory;

}
