package com.skapp.enterprise.invoice.mapper;

import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.CustomerContact;
import com.skapp.enterprise.invoice.model.Project;
import com.skapp.enterprise.invoice.payload.request.customer.CustomerContactDetailsDto;
import com.skapp.enterprise.invoice.payload.response.CustomerContactResponseDto;
import com.skapp.enterprise.invoice.payload.response.CustomerDetailedResponseDto;
import com.skapp.enterprise.invoice.repository.projection.CustomerSummaryData;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

	@Mapping(target = "customerName", source = "name")
	@Mapping(target = "projectIds", expression = "java(mapProjects(customer.getProjects()))")
	@Mapping(target = "customerContacts", expression = "java(mapCustomerContacts(customer.getCustomerContacts()))")
	CustomerDetailedResponseDto customerToCustomerDetailedResponseDto(Customer customer);

	default List<Long> mapProjects(List<Project> projects) {
		return (projects == null) ? List.of() : projects.stream().map(Project::getProjectId).toList();
	}

	default List<CustomerContactResponseDto> mapCustomerContacts(List<CustomerContact> customerContacts) {
		return (customerContacts == null) ? List.of()
				: customerContacts.stream().filter(CustomerContact::getIsActive).map(contact -> {
					CustomerContactResponseDto dto = new CustomerContactResponseDto();
					dto.setId(contact.getId());
					dto.setName(contact.getName());
					dto.setEmail(contact.getEmail());
					dto.setContactNo(contact.getContactNo());
					dto.setJobTitle(contact.getJobTitle());
					return dto;
				}).toList();
	}

	@Mapping(target = "customerName", source = "name")
	CustomerSummaryData customerToCustomerSummaryData(Customer customer);

	@Mapping(target = "name", source = "contactName")
	CustomerContact customerContactDetailsDtoToCustomerContact(CustomerContactDetailsDto customerContactDetailsDto);

	CustomerContactResponseDto customerContactToCustomerContactResponseDto(CustomerContact customerContact);

}
