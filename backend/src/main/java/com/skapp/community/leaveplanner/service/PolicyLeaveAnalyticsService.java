package com.skapp.community.leaveplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.leaveplanner.payload.request.PolicyLeaveTypeBreakdownFilterDto;
import com.skapp.community.leaveplanner.payload.request.PolicyTeamLeaveTrendFilterDto;

public interface PolicyLeaveAnalyticsService {

	ResponseEntityDto getTeamLeaveTrendForTheYear(PolicyTeamLeaveTrendFilterDto policyTeamLeaveTrendFilterDto);

	ResponseEntityDto getLeaveTypeBreakdown(PolicyLeaveTypeBreakdownFilterDto policyLeaveTypeBreakdownFilterDto);

}
