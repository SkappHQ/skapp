package com.skapp.community.peopleplanner.payload.request.employee.employment;

import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class EmployeeEmploymentBasicDetailsDto {

	private String employeeNumber;

	private String email;

	private EmploymentAllocation employmentAllocation;

	private Long[] teamIds;

	private EmployeeEmploymentBasicDetailsManagerDetailsDto primarySupervisor;

	private List<EmployeeEmploymentBasicDetailsManagerDetailsDto> otherSupervisors;

	private LocalDate joinedDate;

	private LocalDate probationStartDate;

	private LocalDate probationEndDate;

	private String workTimeZone;

	private Long workLocationId;

}
