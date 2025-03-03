package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.constant.CommonConstants;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.exception.StripeVerificationException;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.StripeSubscription;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.service.StripeService;
import com.skapp.enterprise.common.service.StripeWebhookService;
import com.skapp.enterprise.common.type.StripeWebhookEventTypes;
import com.skapp.enterprise.common.type.SubscriptionPlan;
import com.skapp.enterprise.common.type.SubscriptionStatus;
import com.skapp.enterprise.common.type.Tier;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@Slf4j
@RequiredArgsConstructor
public class StripeWebhookServiceImpl implements StripeWebhookService {

	@Value("${stripe.webhook-secret}")
	private String webhookSecret;

	private final TenantContext tenantContext;

	private final TenantDao tenantDao;

	private final StripeService stripeService;

	@Override
	public void handleStripeEvent(String payload, String sigHeader) throws SignatureVerificationException {
		log.info("handleStripeEvent: Received Stripe webhook event");

		Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
		String eventType = event.getType();

		log.info("Processing Stripe event type: {}", event.getType());
		if (eventType.equals(StripeWebhookEventTypes.CHECKOUT_SESSION_COMPLETED.getEventType())) {
			handleCheckoutSessionCompleted(event);
		}
		if (eventType.equals(StripeWebhookEventTypes.INVOICE_PAYMENT_FAIL.getEventType())) {
			handleSubscriptionPaymentFail(event);
		}
		if (eventType.equals(StripeWebhookEventTypes.CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END.getEventType())) {
			handleTrialEndSoon(event);
		}
		if (eventType.equals(StripeWebhookEventTypes.INVOICE_PAYMENT_SUCCEEDED.getEventType())) {
			handleSubscriptionPaymentSucceeded(event);
		}
	}

	private void handleCheckoutSessionCompleted(Event event) {
		log.info("handleCheckoutSessionCompleted: Handling checkout session completed event");

		try {
			Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);

			if (session == null) {
				log.error("handleCheckoutSessionCompleted: Failed to deserialize checkout session from event");
				return;
			}

			if (!CommonConstants.Subscription.equals(session.getMode())) {
				log.info("handleCheckoutSessionCompleted: Not a subscription checkout session, ignoring");
				return;
			}

			String tenantId = session.getMetadata().get(EpAuthConstants.TENANT_ID);
			if (tenantId == null || tenantId.isEmpty()) {
				log.error("handleCheckoutSessionCompleted: Tenant ID not found in session metadata");
				return;
			}

			log.info("handleCheckoutSessionCompleted: Processing subscription checkout for tenant: {}", tenantId);
			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

			Tenant tenant = tenantDao.findByTenantName(tenantId);
			if (tenant == null) {
				log.error("handleCheckoutSessionCompleted: Tenant not found: {}", tenantId);
				return;
			}

			String subscriptionId = session.getSubscription();
			if (subscriptionId == null) {
				log.error("handleCheckoutSessionCompleted: No subscription ID in checkout session");
				return;
			}

			Subscription subscription = Subscription.retrieve(subscriptionId);

			String customerId = subscription.getCustomer();
			Customer customer = Customer.retrieve(customerId);
			String billingEmail = customer.getEmail();

			StripeSubscription stripeSubscription = tenant.getStripeSubscription();
			if (stripeSubscription == null) {
				stripeSubscription = new StripeSubscription();
				stripeSubscription.setTenantName(tenant.getTenantName());
				stripeSubscription.setCreatedDate(Instant.now());
				stripeSubscription.setCreatedByEmail(billingEmail);
			}
			else {
				stripeSubscription.setLastModifiedDate(Instant.now());
				stripeSubscription.setLastModifiedByEmail(billingEmail);
			}

			stripeSubscription.setSubscriptionId(subscription.getId());
			stripeSubscription.setCustomerId(subscription.getCustomer());
			stripeSubscription.setSubscriptionStartDate(Instant.ofEpochSecond(subscription.getStartDate()));
			stripeSubscription.setTenant(tenant);

			tenant.setTier(Tier.PRO);
			tenant.setSubscriptionStatus(SubscriptionStatus.FREE_TRIAL);
			if (subscription.getItems() != null && !subscription.getItems().getData().isEmpty()) {
				String priceId = subscription.getItems().getData().getFirst().getPrice().getId();
				SubscriptionPlan plan = stripeService.getSubscriptionPlanFromPriceId(priceId);
				tenant.setSubscriptionPlan(plan);
			}

			tenant.setLastModifiedDate(Instant.now());
			tenant.setBillingEmail(billingEmail);

			if (subscription.getItems() != null && !subscription.getItems().getData().isEmpty()) {
				tenant.setSubscriptionQuantity(subscription.getItems().getData().getFirst().getQuantity());
			}

			tenant.setStripeSubscription(stripeSubscription);

			tenantDao.save(tenant);
			log.info("handleCheckoutSessionCompleted: Successfully saved subscription details for tenant: {}",
					tenantId);
		}
		catch (StripeException e) {
			throw new StripeVerificationException(
					EPCommonMessageConstant.EP_COMMON_ERROR_HANDLE_CHECKOUT_SESSION_COMPLETED, event,
					StripeWebhookEventTypes.CHECKOUT_SESSION_COMPLETED);
		}
	}

	private void handleSubscriptionPaymentSucceeded(Event event) {
		log.info("handleSubscriptionPaymentSucceeded started");

	}

	private void handleSubscriptionPaymentFail(Event event) {
		log.info("Handling subscription payment fail event");

	}

	private void handleTrialEndSoon(Event event) {
		log.info("Handling trial end soon event");

	}

}
