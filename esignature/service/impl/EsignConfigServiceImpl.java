package com.skapp.enterprise.esignature.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.esignature.constant.EsignMessageConstant;
import com.skapp.enterprise.esignature.mapper.EsignMapper;
import com.skapp.enterprise.esignature.model.EsignConfig;
import com.skapp.enterprise.esignature.payload.request.EsignConfigDto;
import com.skapp.enterprise.esignature.payload.response.EsignConfigResponseDto;
import com.skapp.enterprise.esignature.payload.response.EsignExternalConfigResponseDto;
import com.skapp.enterprise.esignature.repository.EsignConfigRepository;
import com.skapp.enterprise.esignature.service.EsignConfigService;
import com.skapp.enterprise.esignature.service.EsignTierValidationService;
import com.skapp.enterprise.esignature.type.DateFormatType;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class EsignConfigServiceImpl implements EsignConfigService {

	private final EsignConfigRepository esignConfigRepository;

	private final EsignMapper esignMapper;

	private final EsignTierValidationService esignTierValidationService;

	@Override
	public void setDefaultEsignConfigs() {
		EsignConfig esignConfig = new EsignConfig();
		esignConfig.setDateFormat(DateFormatType.YYYY_MM_DD);
		esignConfig.setDefaultEnvelopeExpireDays(120);
		esignConfig.setReminderDaysBeforeExpire(6);
		esignConfig.setIsMfaEnabled(false);
		esignConfigRepository.save(esignConfig);
	}

	@Override
	public ResponseEntityDto updateEsignConfig(EsignConfigDto esignConfigDto) {

		EsignConfig esignConfig = esignConfigRepository.findFirstBy()
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_CONFIG_NOT_FOUND));

		if (esignConfigDto.getDateFormat() != null) {
			esignConfig.setDateFormat(esignConfigDto.getDateFormat());
		}

		if (esignConfigDto.getDefaultEnvelopeExpireDays() != null) {
			esignConfig.setDefaultEnvelopeExpireDays(esignConfigDto.getDefaultEnvelopeExpireDays());
		}

		if (esignConfigDto.getReminderDaysBeforeExpire() != null) {
			esignConfig.setReminderDaysBeforeExpire(esignConfigDto.getReminderDaysBeforeExpire());
		}

		if (esignConfigDto.getIsMfaEnabled() != null) {

			boolean isProTier = esignTierValidationService.isProTier();

			if (Boolean.TRUE.equals(esignConfigDto.getIsMfaEnabled()) && !isProTier) {
				throw new ModuleException(EsignMessageConstant.ESIGN_ERROR_MFA_FEATURE_NOT_AVAILABLE_FOR_CURRENT_TIER);
			}

			esignConfig.setIsMfaEnabled(esignConfigDto.getIsMfaEnabled());
		}

		esignConfig = esignConfigRepository.save(esignConfig);
		EsignConfigResponseDto esignConfigResponseDto = esignMapper.esignConfigToEsignConfigResponseDto(esignConfig);

		return new ResponseEntityDto(false, esignConfigResponseDto);
	}

	@Override
	public ResponseEntityDto getEsignConfig() {

		EsignConfig esignConfig = esignConfigRepository.findFirstBy()
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_CONFIG_NOT_FOUND));

		EsignConfigResponseDto esignConfigResponseDto = esignMapper.esignConfigToEsignConfigResponseDto(esignConfig);

		return new ResponseEntityDto(false, esignConfigResponseDto);
	}

	@Override
	public ResponseEntityDto getExternalEsignConfig() {

		EsignConfig esignConfig = esignConfigRepository.findFirstBy()
			.orElseThrow(() -> new ModuleException(EsignMessageConstant.ESIGN_ERROR_CONFIG_NOT_FOUND));

		EsignExternalConfigResponseDto esignConfigResponseDto = new EsignExternalConfigResponseDto();
		esignConfigResponseDto.setDateFormat(esignConfig.getDateFormat().getValue());

		return new ResponseEntityDto(false, esignConfigResponseDto);
	}

}
