package com.skapp.enterprise.invoice.mapper;

import com.skapp.enterprise.invoice.model.Customer;
import com.skapp.enterprise.invoice.model.CustomerContact;
import com.skapp.enterprise.invoice.model.CustomerDocument;
import com.skapp.enterprise.invoice.model.Project;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentCreateRequestDto;
import com.skapp.enterprise.invoice.payload.request.customer.CustomerContactDetailsDto;
import com.skapp.enterprise.invoice.payload.request.customer.CustomerProjectDetailsDto;
import com.skapp.enterprise.invoice.payload.response.CustomerContactResponseDto;
import com.skapp.enterprise.invoice.payload.response.CustomerDetailedResponseDto;
import com.skapp.enterprise.invoice.payload.response.CustomerDocumentResponseDto;
import com.skapp.enterprise.invoice.payload.response.InternalCustomerResponseDto;
import com.skapp.enterprise.invoice.repository.projection.CustomerSummaryData;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

	@Mapping(target = "customerName", source = "name")
	@Mapping(target = "customerProjects", expression = "java(mapProjects(customer.getProjects()))")
	@Mapping(target = "customerContacts", expression = "java(mapCustomerContacts(customer.getCustomerContacts()))")
	CustomerDetailedResponseDto customerToCustomerDetailedResponseDto(Customer customer);

	default List<CustomerProjectDetailsDto> mapProjects(List<Project> projects) {
		return (projects == null) ? List.of() : projects.stream().map(project -> {
			CustomerProjectDetailsDto dto = new CustomerProjectDetailsDto();
			dto.setProjectId(project.getId().getProjectId());
			return dto;
		}).toList();
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
				}).sorted(java.util.Comparator.comparing(CustomerContactResponseDto::getName)).toList();
	}

	@Mapping(target = "customerName", source = "name")
	CustomerSummaryData customerToCustomerSummaryData(Customer customer);

	@Mapping(target = "name", source = "contactName")
	CustomerContact customerContactDetailsDtoToCustomerContact(CustomerContactDetailsDto customerContactDetailsDto);

	CustomerContactResponseDto customerContactToCustomerContactResponseDto(CustomerContact customerContact);

	CustomerDocument customerDocumentCreateRequestDtoToCustomerDocument(CustomerDocumentCreateRequestDto dto);

	@Mapping(target = "customerId", source = "customer.id")
	@Mapping(target = "customerName", source = "customer.name")
	CustomerDocumentResponseDto customerDocumentToCustomerDocumentResponseDto(CustomerDocument customerDocument);

	List<CustomerDocumentResponseDto> customerDocumentsToCustomerDocumentResponseDtos(
			List<CustomerDocument> customerDocuments);

	default List<InternalCustomerResponseDto> customerToInternalCustomerResponseDto(List<Customer> customers) {
		return (customers == null) ? List.of() : customers.stream().map(cus -> {
			InternalCustomerResponseDto dto = new InternalCustomerResponseDto();
			dto.setId(cus.getId());
			dto.setName(cus.getName());
			return dto;
		}).toList();
	}

}
