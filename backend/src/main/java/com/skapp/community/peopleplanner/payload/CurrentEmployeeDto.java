package com.skapp.community.peopleplanner.payload;

import com.skapp.community.peopleplanner.model.EmployeeManager;
import com.skapp.community.peopleplanner.model.EmployeePeriod;
import com.skapp.community.peopleplanner.model.EmployeeProgression;
import com.skapp.community.peopleplanner.model.EmployeeRole;
import com.skapp.community.peopleplanner.model.EmployeeTeam;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@RequiredArgsConstructor
public class CurrentEmployeeDto {

	private Long employeeId;

	private List<EmployeeProgression> employeeProgressions;

	private LocalDate joinDate;

	private Set<EmployeeTeam> teams;

	private Set<EmployeeManager> managers;

	private EmploymentAllocation employmentAllocation;

	private EmployeeRole employeeRole;

	private EmployeePeriod employeePeriod;

}
