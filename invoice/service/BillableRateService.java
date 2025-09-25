package com.skapp.enterprise.invoice.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.model.BillableRate;
import com.skapp.enterprise.invoice.model.Project;
import com.skapp.enterprise.invoice.payload.request.ProjectMemberFilterDto;
import com.skapp.enterprise.invoice.payload.request.invoice.TeamMemberBillableRateUpdateRequestDto;
import com.skapp.enterprise.invoice.payload.response.ProjectUsersResponseDto;

import java.util.List;

public interface BillableRateService {

	List<BillableRate> createProjectMemberBillableRateData(Project customerProject,
			List<ProjectUsersResponseDto> projectUsersResponseDto, ProjectMemberFilterDto projectMemberFilterDto);

	List<BillableRate> updateTeamMemberBillableRates(Project project,
			List<TeamMemberBillableRateUpdateRequestDto> teamMemberBillableRateUpdateRequestDtos);

}
