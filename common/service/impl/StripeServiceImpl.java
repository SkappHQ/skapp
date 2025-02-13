package com.skapp.enterprise.common.service.impl;

import com.skapp.enterprise.common.service.StripeService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.Subscription;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class StripeServiceImpl implements StripeService {

	@Value("${stripe.webhook-secret}")
	private String webhookSecret;

	@Override
	public void handleStripeEvent(String payload, String sigHeader) throws SignatureVerificationException {
		log.info("Received Stripe webhook event");

		Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

		log.info("Processing Stripe event type: {}", event.getType());

		if (event.getType().equals("customer.subscription.created")) {
			handleSubscriptionCreated(event);
		}
	}

	private void handleSubscriptionCreated(Event event) {
		log.info("Handling subscription created event");
		event.getDataObjectDeserializer()
			.getObject()
			.filter(obj -> obj instanceof Subscription)
			.map(obj -> (Subscription) obj)
			.ifPresentOrElse(subscription -> {
				log.info("Subscription Details:");
				log.info("ID: {}", subscription.getId());
				log.info("Customer ID: {}", subscription.getCustomer());
				log.info("Status: {}", subscription.getStatus());
				log.info("Current Period Start: {}", subscription.getCurrentPeriodStart());
				log.info("Current Period End: {}", subscription.getCurrentPeriodEnd());
				log.info("Cancel At Period End: {}", subscription.getCancelAtPeriodEnd());
				log.info("Canceled At: {}", subscription.getCanceledAt());
				log.info("Collection Method: {}", subscription.getCollectionMethod());
				log.info("Latest Invoice: {}", subscription.getLatestInvoice());

				subscription.getItems().getData().forEach(item -> {
					log.info("Plan Details:");
					log.info("  Plan ID: {}", item.getPrice().getId());
					log.info("  Amount: {}", item.getPrice().getUnitAmount());
					log.info("  Currency: {}", item.getPrice().getCurrency());
					log.info("  Interval: {}", item.getPrice().getRecurring().getInterval());
				});
			}, () -> log.error("Failed to deserialize subscription data or invalid type"));
	}

}