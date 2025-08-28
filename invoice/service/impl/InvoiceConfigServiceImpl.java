package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.mapper.InvoiceMapper;
import com.skapp.enterprise.invoice.model.InvoiceConfig;
import com.skapp.enterprise.invoice.payload.request.InvoiceConfigDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceConfigResponseDto;
import com.skapp.enterprise.invoice.repository.InvoiceConfigRepository;
import com.skapp.enterprise.invoice.service.InvoiceConfigService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class InvoiceConfigServiceImpl implements InvoiceConfigService {

	private final InvoiceConfigRepository invoiceConfigRepository;

	private final InvoiceMapper invoiceMapper;

	@Override
	public void setDefaultInvoiceConfigs() {
		InvoiceConfig invoiceConfig = new InvoiceConfig();
		invoiceConfig.setLogoUrl("https://rootcode.skapp.com/logo/logo.png");
		invoiceConfig.setPaymentTerms("Net 30");
		invoiceConfig.setPayToAddress("123 Default St, City, Country");
		invoiceConfigRepository.save(invoiceConfig);
	}

	@Override
	public ResponseEntityDto updateInvoiceConfig(InvoiceConfigDto invoiceConfigDto) {
		InvoiceConfig invoiceConfig = invoiceConfigRepository.findFirstBy()
			.orElseThrow(() -> new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_CONFIG_NOT_FOUND));

		if (invoiceConfigDto.getLogoUrl() != null) {
			invoiceConfig.setLogoUrl(invoiceConfigDto.getLogoUrl());
		}
		if (invoiceConfigDto.getPaymentTerms() != null) {
			invoiceConfig.setPaymentTerms(invoiceConfigDto.getPaymentTerms());
		}
		if (invoiceConfigDto.getPayToAddress() != null) {
			invoiceConfig.setPayToAddress(invoiceConfigDto.getPayToAddress());
		}

		invoiceConfig = invoiceConfigRepository.save(invoiceConfig);
		InvoiceConfigResponseDto invoiceConfigResponseDto = invoiceMapper
			.invoiceConfigToInvoiceConfigResponseDto(invoiceConfig);
		return new ResponseEntityDto(false, invoiceConfigResponseDto);
	}

	@Override
	public ResponseEntityDto getInvoiceConfig() {
		InvoiceConfig invoiceConfig = invoiceConfigRepository.findFirstBy()
			.orElseThrow(() -> new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_CONFIG_NOT_FOUND));

		InvoiceConfigResponseDto invoiceConfigResponseDto = invoiceMapper
			.invoiceConfigToInvoiceConfigResponseDto(invoiceConfig);
		return new ResponseEntityDto(false, invoiceConfigResponseDto);
	}

}
