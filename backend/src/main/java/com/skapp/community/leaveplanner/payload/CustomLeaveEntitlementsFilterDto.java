package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.type.CustomLeaveEntitlementSort;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class CustomLeaveEntitlementsFilterDto {

	@Min(0)
	private int page = 0;

	@Min(1)
	private int size = 10;

	private int year;

	private Boolean isExport = false;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private CustomLeaveEntitlementSort sortKey = CustomLeaveEntitlementSort.CREATED_DATE;

	private String keyword;

}
