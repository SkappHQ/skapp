package com.skapp.enterprise.invoice.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.payload.request.InvoiceConfigRequestDto;

public interface InvoiceConfigService {

	void setDefaultInvoiceConfigs(String organizationLogo, String country);

	ResponseEntityDto updateInvoiceConfig(InvoiceConfigRequestDto dto);

	ResponseEntityDto getInvoiceConfig();

}
