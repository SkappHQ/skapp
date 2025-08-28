package com.skapp.enterprise.invoice.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.InvoiceConfigDto;

public interface InvoiceConfigService {

	void setDefaultInvoiceConfigs();

	ResponseEntityDto updateInvoiceConfig(InvoiceConfigDto dto);

	ResponseEntityDto getInvoiceConfig();

}
