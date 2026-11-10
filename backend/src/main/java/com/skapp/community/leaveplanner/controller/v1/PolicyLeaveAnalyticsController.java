package com.skapp.community.leaveplanner.controller.v1;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.PolicyAbsenceRateFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveHistoryFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveTypeBreakdownFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyTeamLeaveHistoryFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyTeamLeaveTrendFilterDto;
import com.skapp.community.leaveplanner.service.PolicyLeaveAnalyticsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/leave/policy-leave/analytics")
public class PolicyLeaveAnalyticsController {

	private final PolicyLeaveAnalyticsService policyLeaveAnalyticsService;

	@PreAuthorize("hasRole('ROLE_LEAVE_MANAGER')")
	@GetMapping("/team-leave-trend")
	public ResponseEntity<ResponseEntityDto> getTeamLeaveTrendForTheYear(
			@Valid PolicyTeamLeaveTrendFilterDto policyTeamLeaveTrendFilterDto) {
		ResponseEntityDto response = policyLeaveAnalyticsService
			.getTeamLeaveTrendForTheYear(policyTeamLeaveTrendFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasRole('ROLE_LEAVE_MANAGER')")
	@GetMapping("/leave-type-breakdown")
	public ResponseEntity<ResponseEntityDto> getLeaveTypeBreakdown(
			@Valid PolicyLeaveTypeBreakdownFilterDto policyLeaveTypeBreakdownFilterDto) {
		ResponseEntityDto response = policyLeaveAnalyticsService
			.getLeaveTypeBreakdown(policyLeaveTypeBreakdownFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasRole('ROLE_LEAVE_MANAGER')")
	@GetMapping("/team-leave-history/{id}")
	public ResponseEntity<ResponseEntityDto> getTeamLeaveHistory(@PathVariable Long id,
			PolicyTeamLeaveHistoryFilterDto policyTeamLeaveHistoryFilterDto) {
		ResponseEntityDto response = policyLeaveAnalyticsService.getTeamLeaveHistory(id,
				policyTeamLeaveHistoryFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasRole('ROLE_LEAVE_MANAGER')")
	@GetMapping("/employee-leave-history/{id}")
	public ResponseEntity<ResponseEntityDto> getEmployeeLeaveHistory(@PathVariable Long id,
			PolicyLeaveHistoryFilterDto policyLeaveHistoryFilterDto) {
		ResponseEntityDto response = policyLeaveAnalyticsService.getEmployeeLeaveHistory(id,
				policyLeaveHistoryFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@PreAuthorize("hasRole('ROLE_LEAVE_MANAGER')")
	@GetMapping("/absence-rate")
	public ResponseEntity<ResponseEntityDto> getAbsenceRate(
			@Valid PolicyAbsenceRateFilterDto policyAbsenceRateFilterDto) {
		ResponseEntityDto response = policyLeaveAnalyticsService.getAbsenceRate(policyAbsenceRateFilterDto);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

}
