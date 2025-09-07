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

	@Mapping(target = "itemCount",
			expression = "java(invoice.getInvoiceItems() != null ? invoice.getInvoiceItems().size() : 0)")
	@Mapping(target = "expenseCount",
			expression = "java(invoice.getInvoiceExpenses() != null ? invoice.getInvoiceExpenses().size() : 0)")
	@Mapping(target = "taxCount",
			expression = "java(invoice.getInvoiceTaxes() != null ? invoice.getInvoiceTaxes().size() : 0)")
	InvoiceResponseDto invoiceToInvoiceResponseDto(Invoice invoice);

	List<InvoiceResponseDto> invoicesToInvoiceResponseDtos(List<Invoice> invoices);

	CreateInvoiceResponseDto invoiceToCreateInvoiceResponseDto(Invoice invoice);

}
