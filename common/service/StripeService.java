package com.skapp.enterprise.common.service;

import com.stripe.exception.SignatureVerificationException;

public interface StripeService {

	void handleStripeEvent(String payload, String sigHeader) throws SignatureVerificationException;

}
