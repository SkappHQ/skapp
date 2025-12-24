package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.BulkLeaveEntitlementDto;
import com.skapp.community.leaveplanner.payload.CarryForwardLeaveTypesFilterDto;
import com.skapp.community.leaveplanner.payload.CustomEntitlementsFilterDto;
import com.skapp.community.leaveplanner.payload.CustomLeaveEntitlementDto;
import com.skapp.community.leaveplanner.payload.CustomLeaveEntitlementPatchRequestDto;
import com.skapp.community.leaveplanner.payload.CustomLeaveEntitlementsFilterDto;
import com.skapp.community.leaveplanner.payload.LeaveEntitlementPatchRequestDto;
import com.skapp.community.leaveplanner.payload.LeaveEntitlementsDto;
import com.skapp.community.leaveplanner.payload.LeaveEntitlementsFilterDto;

import java.util.List;

public interface LeaveEntitlementService {

	String processLeaveEntitlements(LeaveEntitlementsDto leaveEntitlementsDto);

	void updateLeaveEntitlements(Long id, LeaveEntitlementPatchRequestDto leaveEntitlementPatchRequestDto);

	void updateCustomLeaveEntitlements(Long id,
			CustomLeaveEntitlementPatchRequestDto customLeaveEntitlementPatchRequestDto);

	ResponseEntityDto deleteCustomLeaveEntitlements(Long id);

	ResponseEntityDto deleteDefaultEntitlements(Long id);

	ResponseEntityDto createCustomEntitlementForEmployee(CustomLeaveEntitlementDto customEntitlementDto);

	ResponseEntityDto addLeaveEntitlements(LeaveEntitlementsDto leaveEntitlementsDto);

	ResponseEntityDto getLeaveEntitlementById(Long id);

	ResponseEntityDto getCustomLeaveEntitlementById(Long id);

	ResponseEntityDto forceCarryForwardEntitlements(List<Long> leaveTypes, Integer cycleStartYear);

	ResponseEntityDto getCarryForwardEntitlements(CarryForwardLeaveTypesFilterDto carryForwardLeaveTypesFilterDto);

	ResponseEntityDto getAllCustomLeaveEntitlements(CustomEntitlementsFilterDto customEntitlementsFilterDto);

	ResponseEntityDto addBulkNewLeaveEntitlement(BulkLeaveEntitlementDto bulkLeaveEntitlementDto);

	ResponseEntityDto getLeaveEntitlementByDate(CustomLeaveEntitlementsFilterDto customLeaveEntitlementsFilterDto);

	ResponseEntityDto getCurrentUserLeaveEntitlements(LeaveEntitlementsFilterDto leaveEntitlementsFilterDto);

	ResponseEntityDto getCurrentUserLeaveEntitlementBalance(Long id);

}
