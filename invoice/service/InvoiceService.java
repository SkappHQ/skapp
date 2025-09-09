package com.skapp.enterprise.invoice.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.InvoiceFilterRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceRequestDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceSearchRequestDto;

public interface InvoiceService {

	ResponseEntityDto createInvoice(CreateInvoiceRequestDto createInvoiceRequestDto);

	ResponseEntityDto getFilteredInvoices(InvoiceFilterRequestDto invoiceFilterRequestDto);

	ResponseEntityDto getInvoiceTierLimitations();

	ResponseEntityDto getInvoiceKPI();

	ResponseEntityDto searchInvoices(InvoiceSearchRequestDto invoiceSearchRequestDto);

}
