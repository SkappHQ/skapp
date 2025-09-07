package com.skapp.enterprise.invoice.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceRequestDto;
import com.skapp.enterprise.invoice.payload.request.InvoiceFilterRequestDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceSearchRequestDto;

public interface InvoiceService {

    ResponseEntityDto createInvoice(CreateInvoiceRequestDto createInvoiceRequestDto);

    ResponseEntityDto getInvoices();

    ResponseEntityDto getFilteredInvoices(InvoiceFilterRequestDto invoiceFilterRequestDto);


    ResponseEntityDto getInvoiceTierLimitations();

    ResponseEntityDto searchInvoicesByName(InvoiceSearchRequestDto invoiceSearchRequestDto);

    ResponseEntityDto getInvoicesSummary();
}
