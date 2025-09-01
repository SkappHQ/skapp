package com.skapp.enterprise.invoice.mapper;

import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.Project;
import com.skapp.enterprise.invoice.payload.response.CustomerDetailedResponseDto;
import com.skapp.enterprise.invoice.repository.projection.CustomerSummaryData;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

	@Mapping(target = "customerName", source = "name")
	@Mapping(target = "projectIds", expression = "java(mapProjects(customer.getProjects()))")
	CustomerDetailedResponseDto customerToCustomerDetailedResponseDto(Customer customer);

	default List<Long> mapProjects(List<Project> projects) {
		return (projects == null) ? List.of() : projects.stream().map(Project::getProjectId).toList();
	}

	@Mapping(target = "customerName", source = "name")
	CustomerSummaryData customerToCustomerSummaryData(Customer customer);

}
