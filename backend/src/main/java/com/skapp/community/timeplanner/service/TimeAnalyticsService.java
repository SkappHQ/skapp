package com.skapp.community.timeplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.timeplanner.payload.request.AttendanceDashboardSummaryFilterDto;
import com.skapp.community.timeplanner.payload.request.AverageHoursWorkedTrendFilterDto;
import com.skapp.community.timeplanner.payload.request.ClockInClockOutTrendFilterDto;
import com.skapp.community.timeplanner.payload.request.ClockInSummaryFilterDto;
import com.skapp.community.timeplanner.payload.request.LateArrivalTrendFilterDto;

public interface TimeAnalyticsService {

	ResponseEntityDto getClockInClockOutTrend(ClockInClockOutTrendFilterDto clockInClockOutTrendFilterDto);

	ResponseEntityDto lateArrivalTrend(LateArrivalTrendFilterDto lateArrivalTrendFilterDto);

	ResponseEntityDto averageHoursWorkedTrend(AverageHoursWorkedTrendFilterDto averageHoursWorkedTrendFilterDto);

	ResponseEntityDto attendanceDashboardSummary(
			AttendanceDashboardSummaryFilterDto attendanceDashboardSummaryFilterDto);

	ResponseEntityDto clockInSummary(ClockInSummaryFilterDto clockInSummaryFilterDto);

	ResponseEntityDto getIndividualWorkUtilization(Long id);

	ResponseEntityDto averageEmployeeHoursWorkedTrend(AverageHoursWorkedTrendFilterDto averageHoursWorkedTrendFilterDto,
			Long employeeId);

}
