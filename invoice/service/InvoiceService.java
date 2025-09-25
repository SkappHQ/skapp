package com.skapp.enterprise.invoice.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.InvoiceFilterRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.CreateInvoiceRequestDto;
import com.skapp.enterprise.invoice.payload.request.invoice.InvoiceStatusUpdateRequestDto;

import java.time.LocalDate;

public interface InvoiceService {

	ResponseEntityDto createInvoice(CreateInvoiceRequestDto createInvoiceRequestDto);

	ResponseEntityDto getFilteredInvoices(InvoiceFilterRequestDto invoiceFilterRequestDto);

	ResponseEntityDto getInvoiceTierLimitations();

	ResponseEntityDto getInvoiceKPI(Long customerId);

	ResponseEntityDto getInvoiceId(Long customerId);

	ResponseEntityDto getInvoiceById(Long invoiceId);

	ResponseEntityDto updateInvoiceStatus(InvoiceStatusUpdateRequestDto invoiceStatusUpdateRequestDto);

	LocalDate getCustomerProjectLastInvoiceDate(Long customerId, Long projectId);

	void handleInvoiceExpiration(Long invoiceId);

}
