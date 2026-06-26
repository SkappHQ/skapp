package com.skapp.community.peopleplanner.payload.request;

import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.community.peopleplanner.type.EmployeeSort;
import com.skapp.community.peopleplanner.type.EmploymentAllocation;
import com.skapp.community.peopleplanner.type.EmploymentType;
import com.skapp.community.peopleplanner.type.Gender;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.util.List;

@Getter
@Setter
public class EmployeeFilterDtoV2 {

	@Min(0)
	private int page = 0;

	@Min(1)
	private int size = 5;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private EmployeeSort sortKey = EmployeeSort.NAME;

	private List<Long> team;

	private List<String> permissions;

	private List<EmploymentType> employmentTypes;

	private List<AccountStatus> accountStatus;

	private List<EmploymentAllocation> employmentAllocations;

	private String searchKeyword;

	private Gender gender;

	private List<String> nationality;

}
