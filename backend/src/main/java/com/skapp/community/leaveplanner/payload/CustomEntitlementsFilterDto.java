package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.type.CustomEntitlementSort;
import com.skapp.community.leaveplanner.type.EmployeeSort;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class CustomEntitlementsFilterDto {

	@Min(0)
	private int page = 0;

	@Min(1)
	private int size = 10;

	private LocalDate validFrom;

	private LocalDate validTo;

	@Nullable
	private String keyword;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private int year;

	private CustomEntitlementSort sortKey = CustomEntitlementSort.CREATION_DATE;

	private EmployeeSort sortKeySearch = EmployeeSort.NAME;

	private List<Long> leaveTypeId;

}
