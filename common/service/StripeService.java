package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.CreateSubscriptionRequestDto;
import com.stripe.exception.SignatureVerificationException;

public interface StripeService {

	void handleStripeEvent(String payload, String sigHeader) throws SignatureVerificationException;

	ResponseEntityDto createSubscription(CreateSubscriptionRequestDto subscriptionRequestDto);

}
