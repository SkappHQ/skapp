package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.payload.response.EnvelopeTierLimitationResponseDto;
import com.skapp.enterprise.esignature.payload.response.EsignTierValidationDto;

public interface EsignTierValidationService {

	EsignTierValidationDto resolveTierContext();

	EnvelopeTierLimitationResponseDto processEnvelopeTierLimitation(EsignTierValidationDto esignTierValidationDto);

}
