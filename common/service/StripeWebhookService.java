package com.skapp.enterprise.common.service;

import com.stripe.exception.StripeException;

public interface StripeWebhookService {

	void handleStripeEvent(String payload, String sigHeader) throws StripeException;

}
