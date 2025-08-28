package com.skapp.enterprise.invoice.mapper;

import com.skapp.enterprise.invoice.model.InvoiceConfig;
import com.skapp.enterprise.invoice.payload.response.InvoiceConfigResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InvoiceMapper {

	InvoiceConfigResponseDto invoiceConfigToInvoiceConfigResponseDto(InvoiceConfig invoiceConfig);

}