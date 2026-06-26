package com.skapp.community.leaveplanner.payload;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BulkLeaveEntitlementDto {

	private int year;

	private List<EntitlementDetailsDto> entitlementDetailsList;

}
