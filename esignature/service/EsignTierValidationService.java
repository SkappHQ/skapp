package com.skapp.enterprise.esignature.service;

import com.skapp.enterprise.esignature.payload.response.EnvelopeTierLimitationResponseDto;
import com.skapp.enterprise.common.payload.SubscriptionValidationDto;

public interface EsignTierValidationService {

	SubscriptionValidationDto resolveTierContext();

	EnvelopeTierLimitationResponseDto processEnvelopeTierLimitation(SubscriptionValidationDto esignTierValidationDto);

}
