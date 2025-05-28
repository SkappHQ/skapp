package com.skapp.enterprise.common.service;

import com.skapp.enterprise.common.payload.DashboardEmailOrganizationDetailsDto;

public interface DashboardService {

	DashboardEmailOrganizationDetailsDto getDashboardEmailOrganizationDetails(String superAdminEmail);

}
