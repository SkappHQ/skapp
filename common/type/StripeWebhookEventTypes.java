package com.skapp.enterprise.common.type;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StripeWebhookEventTypes {

	CUSTOMER_SUBSCRIPTION_CREATED("customer.subscription.created"), INVOICE_PAYMENT_FAIL("invoice.payment_failed"),
	CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END("customer.subscription.trial_will_end"),
	INVOICE_PAYMENT_SUCCEEDED("invoice.payment_succeeded"), CHECKOUT_SESSION_COMPLETED("checkout.session.completed"),
	CUSTOMER_SUBSCRIPTION_DELETED("customer.subscription.deleted"),
	CUSTOMER_SUBSCRIPTION_UPDATED("customer.subscription.updated");

	private final String eventType;

}
