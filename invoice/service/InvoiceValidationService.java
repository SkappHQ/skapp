package com.skapp.enterprise.invoice.service;

import com.skapp.enterprise.invoice.payload.request.InvoiceFilterRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceExpenseDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceItemDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceTaxDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceSearchRequestDto;

import java.util.List;

public interface InvoiceValidationService {

	void validateCreateInvoiceRequest(CreateInvoiceRequestDto createInvoiceRequestDto);

	void validateCreateInvoiceItemsRequest(List<CreateInvoiceItemDto> invoiceItems);

	void validateCreateInvoiceExpensesRequest(List<CreateInvoiceExpenseDto> invoiceExpenses);

	void validateCreateInvoiceTaxesRequest(List<CreateInvoiceTaxDto> invoiceTaxes);

	void validateInvoiceFilterRequest(InvoiceFilterRequestDto invoiceFilterRequestDto);

	void validateInvoiceSearchRequest(InvoiceSearchRequestDto invoiceSearchRequestDto);

	void validateInvoiceGetRequest(int page, int size, String sortBy, String sortDirection);

}
