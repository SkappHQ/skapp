package com.skapp.enterprise.invoice.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.ProjectFilterRequestDto;
import com.skapp.enterprise.invoice.payload.request.ProjectMemberFilterRequestDto;
import jakarta.servlet.http.HttpServletRequest;

public interface ProjectService {

	ResponseEntityDto getAllProjects(HttpServletRequest request);

	ResponseEntityDto getProjectsByCustomer(HttpServletRequest request, Long customerId);

	ResponseEntityDto getProjectsSummaryByCustomer(HttpServletRequest request,
			ProjectFilterRequestDto projectFilterRequestDto);

	ResponseEntityDto getProjectMembers(HttpServletRequest request,
			ProjectMemberFilterRequestDto projectMemberFilterRequestDto);

}
