package com.skapp.enterprise.invoice.mapper;

import com.skapp.enterprise.invoice.model.Invoice;
import com.skapp.enterprise.invoice.model.InvoiceConfig;
import com.skapp.enterprise.invoice.payload.response.CreateInvoiceResponseDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceConfigResponseDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InvoiceMapper {

	InvoiceConfigResponseDto invoiceConfigToInvoiceConfigResponseDto(InvoiceConfig invoiceConfig);

	InvoiceResponseDto invoiceToInvoiceResponseDto(Invoice invoice);

	List<InvoiceResponseDto> invoicesToInvoiceResponseDtos(List<Invoice> invoices);

}
