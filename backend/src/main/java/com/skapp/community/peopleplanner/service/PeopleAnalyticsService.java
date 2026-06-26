package com.skapp.community.peopleplanner.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.peopleplanner.payload.request.EmploymentBreakdownFilterDto;
import com.skapp.community.peopleplanner.payload.request.PeopleAnalyticsFilterDto;
import com.skapp.community.peopleplanner.payload.request.PeopleAnalyticsPeopleFilterDto;

public interface PeopleAnalyticsService {

	ResponseEntityDto getDashBoardSummary(PeopleAnalyticsFilterDto peopleAnalyticsService);

	ResponseEntityDto getGenderDistribution(PeopleAnalyticsFilterDto peopleAnalyticsFilterDto);

	ResponseEntityDto getEmploymentBreakdown(EmploymentBreakdownFilterDto employmentBreakdownFilterDto);

	ResponseEntityDto getJobFamilyOverview(PeopleAnalyticsFilterDto peopleAnalyticsFilterDto);

	ResponseEntityDto getPeopleSection(PeopleAnalyticsPeopleFilterDto peopleAnalyticsPeopleFilterDto);

}
