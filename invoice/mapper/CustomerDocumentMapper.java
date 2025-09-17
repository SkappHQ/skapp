package com.skapp.enterprise.invoice.mapper;

import com.skapp.enterprise.invoice.model.CustomerDocument;
import com.skapp.enterprise.invoice.payload.request.CustomerDocumentCreateRequestDto;
import com.skapp.enterprise.invoice.payload.response.CustomerDocumentResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CustomerDocumentMapper {

	@Mapping(target = "id", ignore = true)
	@Mapping(target = "customer", ignore = true)
	@Mapping(target = "createdBy", ignore = true)
	@Mapping(target = "createdDate", ignore = true)
	@Mapping(target = "lastModifiedBy", ignore = true)
	@Mapping(target = "lastModifiedDate", ignore = true)
	CustomerDocument customerDocumentCreateRequestDtoToCustomerDocument(CustomerDocumentCreateRequestDto dto);

	@Mapping(target = "customerId", source = "customer.id")
	@Mapping(target = "customerName", source = "customer.name")
	CustomerDocumentResponseDto customerDocumentToCustomerDocumentResponseDto(CustomerDocument customerDocument);

	List<CustomerDocumentResponseDto> customerDocumentsToCustomerDocumentResponseDtos(List<CustomerDocument> customerDocuments);

}
