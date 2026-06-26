package com.skapp.community.leaveplanner.payload;

import com.skapp.community.leaveplanner.payload.response.LeaveTypeBasicDetailsResponseDto;
import com.skapp.community.peopleplanner.payload.request.EmployeeBasicDetailsResponseDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
public class LeaveEntitlementResponseDto {

	private long entitlementId;

	private LeaveTypeBasicDetailsResponseDto leaveType;

	private LocalDate validFrom;

	private LocalDate validTo;

	private Boolean isActive = true;

	private Float totalDaysAllocated;

	private Float totalDaysUsed;

	private Float balanceInDays;

	private String reason;

	private Boolean isManual;

	private Boolean isOverride;

	private EmployeeBasicDetailsResponseDto employee;

}
