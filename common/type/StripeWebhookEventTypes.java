package com.skapp.enterprise.common.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StripeWebhookEventTypes {

	CUSTOMER_SUBSCRIPTION_CREATED("customer.subscription.created");

	private final String eventType;

}
