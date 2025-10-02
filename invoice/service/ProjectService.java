package com.skapp.enterprise.invoice.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.ImportTimeLogFilterDto;
import com.skapp.enterprise.invoice.payload.request.ProjectFilterRequestDto;
import com.skapp.enterprise.invoice.payload.request.ProjectMemberFilterDto;
import com.skapp.enterprise.invoice.payload.request.invoice.TeamMemberBillableRateUpdateRequestDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.util.List;

public interface ProjectService {

	ResponseEntityDto getAllProjects(HttpServletRequest request);

	ResponseEntityDto getProjectsByCustomer(HttpServletRequest request, Long customerId);

	ResponseEntityDto getProjectsSummaryByCustomer(HttpServletRequest request,
			ProjectFilterRequestDto projectFilterRequestDto);

	ResponseEntityDto getProjectMembers(HttpServletRequest request,
			ProjectMemberFilterDto projectMemberFilterRequestDto);

	ResponseEntityDto updateTeamMemberBillableRates(Long customerId, Long projectId,
			List<TeamMemberBillableRateUpdateRequestDto> teamMemberBillableRateUpdateRequestDtos);

	ResponseEntityDto importTimeLogs(HttpServletRequest request, ImportTimeLogFilterDto importTimeLogFilterDto);

}
