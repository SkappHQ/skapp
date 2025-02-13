package com.skapp.enterprise.common.config;

import com.stripe.Stripe;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StripeConfig {

	public StripeConfig(@Value("${stripe.secret-key}") String stripeApiKey) {
		Stripe.apiKey = stripeApiKey;
	}

}