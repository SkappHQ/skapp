package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.EmployeeSort;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.community.peopleplanner.type.EmploymentType;
import com.skapp.community.peopleplanner.type.Gender;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Getter
@Setter
public class EmployeeExportFilterDto {

	private EmployeeSort sortKey = EmployeeSort.NAME;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private List<Long> team;

	private List<Long> role;

	private List<String> permissions;

	private List<EmploymentType> employmentTypes;

	private List<AccountStatus> accountStatus = new ArrayList<>(Collections.singletonList(AccountStatus.ACTIVE));

	private List<EmploymentAllocation> employmentAllocations;

	private Boolean isExport = false;

	private String searchKeyword;

	private Gender gender;

	private List<String> nationality;

}
