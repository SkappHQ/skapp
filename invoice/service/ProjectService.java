package com.skapp.enterprise.invoice.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.ProjectFilterRequestDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

public interface ProjectService {

	ResponseEntityDto getAllProjects(HttpServletRequest request);

	ResponseEntityDto getProjectsByCustomer(HttpServletRequest request, Long customerId);

	ResponseEntityDto getProjectsSummaryByCustomer(HttpServletRequest request,
			ProjectFilterRequestDto projectFilterRequestDto);

}
