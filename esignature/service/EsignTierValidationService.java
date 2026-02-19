package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.payload.response.EnvelopeTierLimitationResponseDto;

public interface EsignTierValidationService {

	boolean isProTier();

	boolean isProTierActive();

	EnvelopeTierLimitationResponseDto processEnvelopeTierLimitation();

}
