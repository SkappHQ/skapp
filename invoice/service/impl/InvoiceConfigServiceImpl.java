package com.skapp.enterprise.invoice.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.invoice.constant.InvoiceCommonConstant;
import com.skapp.enterprise.invoice.constant.InvoiceMessageConstant;
import com.skapp.enterprise.invoice.mapper.InvoiceMapper;
import com.skapp.enterprise.invoice.model.InvoiceConfig;
import com.skapp.enterprise.invoice.payload.request.InvoiceConfigRequestDto;
import com.skapp.enterprise.invoice.payload.response.InvoiceConfigResponseDto;
import com.skapp.enterprise.invoice.repository.InvoiceConfigRepository;
import com.skapp.enterprise.invoice.service.InvoiceConfigService;
import com.skapp.enterprise.invoice.service.InvoiceConfigValidationService;
import com.skapp.enterprise.invoice.type.CurrencyType;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class InvoiceConfigServiceImpl implements InvoiceConfigService {

	private final InvoiceConfigRepository invoiceConfigRepository;

	private final InvoiceMapper invoiceMapper;

	private final InvoiceConfigValidationService invoiceConfigValidationService;

	@Override
	public void setDefaultInvoiceConfigs(String organizationLogo, String country) {
		InvoiceConfig invoiceConfig = new InvoiceConfig();
		invoiceConfig.setInvoiceLogo(organizationLogo);
		invoiceConfig.setCurrency(CurrencyType.USD);
		invoiceConfig.setCountry(country);
		invoiceConfig.setPaymentTerms(InvoiceCommonConstant.INVOICE_CONFIG_DEFAULT_PAYMENT_TERMS);
		invoiceConfig.setPayToAddress(InvoiceCommonConstant.INVOICE_CONFIG_DEFAULT_ADDRESS);
		invoiceConfigRepository.save(invoiceConfig);
	}

	@Override
	public ResponseEntityDto updateInvoiceConfig(InvoiceConfigRequestDto invoiceConfigDto) {
		InvoiceConfig invoiceConfig = invoiceConfigRepository.findFirstBy()
			.orElseThrow(() -> new ModuleException(InvoiceMessageConstant.INVOICE_ERROR_CONFIG_NOT_FOUND));

		invoiceConfigValidationService.validateInvoiceConfigRequest(invoiceConfigDto);

		if (invoiceConfigDto.getInvoiceLogo() != null) {
			invoiceConfig.setInvoiceLogo(invoiceConfigDto.getInvoiceLogo());
		}
		if (invoiceConfigDto.getCurrency() != null) {
			invoiceConfig.setCurrency(invoiceConfigDto.getCurrency());
		}
		if (invoiceConfigDto.getCountry() != null) {
			invoiceConfig.setCountry(invoiceConfigDto.getCountry());
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
