package com.skapp.enterprise.invoice.mapper;

import com.skapp.enterprise.invoice.model.Invoice;
import com.skapp.enterprise.invoice.model.InvoiceConfig;
import com.skapp.enterprise.invoice.model.InvoiceExpense;
import com.skapp.enterprise.invoice.model.InvoiceItem;
import com.skapp.enterprise.invoice.model.InvoiceTax;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceExpenseDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceItemDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceTaxDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceConfigResponseDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface InvoiceMapper {

	InvoiceConfigResponseDto invoiceConfigToInvoiceConfigResponseDto(InvoiceConfig invoiceConfig);

	@Mapping(target = "customerId", source = "invoice.customer.id")
    @Mapping(target = "customerName", source = "invoice.customer.name")
	InvoiceResponseDto invoiceToInvoiceResponseDto(Invoice invoice);

	@Mapping(target = "customerId", source = "invoice.customer.id")
	@Mapping(target = "customerName", source = "invoice.customer.name")
	List<InvoiceResponseDto> invoicesToInvoiceResponseDtos(List<Invoice> invoices);

	Invoice CreateInvoiceRequestDtoToInvoice(CreateInvoiceRequestDto createInvoiceRequestDto);

	InvoiceItem CreateInvoiceItemDtoToInvoiceItem(CreateInvoiceItemDto createInvoiceItemDto);

	InvoiceExpense CreateInvoiceExpenseDtoToInvoiceExpense(CreateInvoiceExpenseDto createInvoiceExpenseDto);

	InvoiceTax CreateInvoiceTaxDtoToInvoiceTax(CreateInvoiceTaxDto createInvoiceTaxDto);

}
