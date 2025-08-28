package com.skapp.enterprise.invoice.mapper;

import com.skapp.enterprise.invoice.model.InvoiceConfig;
import com.skapp.enterprise.invoice.payload.response.InvoiceConfigResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InvoiceMapper {

	@Mapping(source = "logoUrl", target = "logoUrl")
	@Mapping(source = "paymentTerms", target = "paymentTerms")
	@Mapping(source = "payToAddress", target = "payToAddress")
	InvoiceConfigResponseDto invoiceConfigToInvoiceConfigResponseDto(InvoiceConfig invoiceConfig);

}