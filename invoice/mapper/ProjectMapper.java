package com.skapp.enterprise.invoice.mapper;

import com.skapp.enterprise.invoice.model.BillableRate;
import com.skapp.enterprise.invoice.model.Project;
import com.skapp.enterprise.invoice.payload.response.ProjectMembersResponseDto;
import com.skapp.enterprise.invoice.payload.response.project.InternalProjectCreationResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

	default List<ProjectMembersResponseDto> memberBillableRateListToProjectMembersResponseDto(
			List<BillableRate> memberBillableRateList) {
		return (memberBillableRateList == null) ? List.of() : memberBillableRateList.stream().map(billability -> {
			ProjectMembersResponseDto dto = new ProjectMembersResponseDto();
			dto.setId(billability.getId());
			dto.setEmployeeId(billability.getEmployee().getEmployeeId());
			dto.setName(billability.getEmployee().getFullName());
			dto.setAuthPic(billability.getEmployee().getAuthPic());
			dto.setJobTitle(billability.getEmployee().getJobTitle() != null
					? billability.getEmployee().getJobTitle().getName() : "");
			dto.setBillableRate(billability.getBillableRate());
			dto.setBillableFrequency(billability.getBillableFrequency());
			return dto;
		}).toList();
	}

	@Mapping(target = "projectId", source = "project.id.projectId")
	@Mapping(target = "customer", source = "project.id.customer")
	InternalProjectCreationResponseDto projectToInternalProjectCreationResponseDto(Project project);

}
