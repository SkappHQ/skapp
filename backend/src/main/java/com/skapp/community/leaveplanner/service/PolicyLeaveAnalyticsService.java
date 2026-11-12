package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.PolicyAbsenceRateFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveHistoryFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveTypeBreakdownFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveUtilizationFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyTeamLeaveHistoryFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyTeamLeaveTrendFilterDto;

public interface PolicyLeaveAnalyticsService {

	ResponseEntityDto getTeamLeaveTrendForTheYear(PolicyTeamLeaveTrendFilterDto policyTeamLeaveTrendFilterDto);

	ResponseEntityDto getLeaveTypeBreakdown(PolicyLeaveTypeBreakdownFilterDto policyLeaveTypeBreakdownFilterDto);

	ResponseEntityDto getEmployeeLeaveUtilization(Long employeeId,
			PolicyLeaveUtilizationFilterDto policyLeaveUtilizationFilterDto);

	ResponseEntityDto getTeamLeaveHistory(Long teamId, PolicyTeamLeaveHistoryFilterDto policyTeamLeaveHistoryFilterDto);

	ResponseEntityDto getEmployeeLeaveHistory(Long employeeId, PolicyLeaveHistoryFilterDto policyLeaveHistoryFilterDto);

	ResponseEntityDto getAbsenceRate(PolicyAbsenceRateFilterDto policyAbsenceRateFilterDto);

}
