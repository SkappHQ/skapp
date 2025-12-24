package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.type.CustomLeaveEntitlementSort;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class CustomLeaveEntitlementsExportDto {

	private int year;

	private Sort.Direction sortOrder = Sort.Direction.ASC;

	private CustomLeaveEntitlementSort sortKey = CustomLeaveEntitlementSort.CREATED_DATE;

	private String keyword;

}
