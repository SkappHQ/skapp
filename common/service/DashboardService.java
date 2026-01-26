package com.skapp.enterprise.common.service;

import com.skapp.enterprise.common.payload.DashboardEmailOrganizationDetailsDto;
import com.skapp.enterprise.common.payload.response.DashboardNotificationCountDto;

public interface DashboardService {

	DashboardEmailOrganizationDetailsDto getDashboardEmailOrganizationDetails(String superAdminEmail);

	DashboardNotificationCountDto getDashboardNotificationCounts();

}
