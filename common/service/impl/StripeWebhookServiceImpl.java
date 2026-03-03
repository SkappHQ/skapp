package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.service.SystemVersionService;
import com.skapp.community.common.type.SystemVersionTypes;
import com.skapp.community.common.type.VersionType;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.config.SpecialTenantConfig;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.exception.StripeVerificationException;
import com.skapp.enterprise.common.masterrepository.StripeSubscriptionDao;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.StripeSubscription;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.service.DashboardEmailService;
import com.skapp.enterprise.common.service.StripeEmailService;
import com.skapp.enterprise.common.service.StripeService;
import com.skapp.enterprise.common.service.StripeWebhookService;
import com.skapp.enterprise.common.type.StripeSubscriptionType;
import com.skapp.enterprise.common.type.StripeWebhookEventTypes;
import com.skapp.enterprise.common.type.SubscriptionPlan;
import com.skapp.enterprise.common.type.SubscriptionStatus;
import com.skapp.enterprise.common.type.TenantStatus;
import com.skapp.enterprise.common.type.Tier;
import com.skapp.enterprise.people.service.EpRolesService;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.Invoice;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.InvoiceUpcomingParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class StripeWebhookServiceImpl implements StripeWebhookService {

	private final EmployeeDao employeeDao;

	private final SystemVersionService systemVersionService;

	private final TenantContext tenantContext;

	private final TenantDao tenantDao;

	private final StripeService stripeService;

	private final StripeEmailService stripeEmailService;

	private final StripeSubscriptionDao stripeSubscriptionDao;

	private final SpecialTenantConfig specialTenantConfig;

	private final DashboardEmailService dashboardEmailService;

	private final EpRolesService epRolesService;

	@Value("${stripe.webhook-secret}")
	private String webhookSecret;

	@Value("${stripe.product.core-product-id}")
	private String stripeCoreProductId;

	@Value("${stripe.product.pro-product-id}")
	private String stripeProProductId;

	@Override
	public void handleStripeEvent(String payload, String sigHeader) throws StripeException {
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
		if (eventType.equals(StripeWebhookEventTypes.INVOICE_PAYMENT_SUCCEEDED.getEventType())) {
			handleSubscriptionPaymentSucceeded(event);
		}
		if (eventType.equals(StripeWebhookEventTypes.CUSTOMER_SUBSCRIPTION_DELETED.getEventType())) {
			handleSubscriptionCancelled(event);
		}
		if (eventType.equals(StripeWebhookEventTypes.CUSTOMER_SUBSCRIPTION_UPDATED.getEventType())) {
			handleSubscriptionUpdated(event);
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

			if (!EpCommonConstants.SUBSCRIPTION.equals(session.getMode())) {
				log.info("handleCheckoutSessionCompleted: Not a subscription checkout session, ignoring");
				return;
			}

			String tenantId = session.getMetadata().get(EpAuthConstants.TENANT_ID);
			if (tenantId == null || tenantId.isEmpty()) {
				log.error("handleCheckoutSessionCompleted: Tenant ID not found in session metadata");
				return;
			}

			log.info("handleCheckoutSessionCompleted: Processing subscription checkout for tenant: {}", tenantId);
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

			if (subscription.getItems() == null || subscription.getItems().getData().isEmpty()) {
				log.error(
						"handleCheckoutSessionCompleted: Subscription {} has no line items; cannot determine tier for tenant: {}",
						subscription.getId(), tenantId);
				return;
			}

			String productId = subscription.getItems().getData().getFirst().getPrice().getProduct();

			if (productId == null) {
				log.error(
						"handleCheckoutSessionCompleted: Product ID is null on subscription {} for tenant: {}; cannot determine tier",
						subscription.getId(), tenantId);
				return;
			}

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

			if (stripeProProductId.equals(productId)) {
				tenant.setTier(Tier.PRO);
			}
			else if (stripeCoreProductId.equals(productId)) {
				tenant.setTier(Tier.CORE);
			}
			else {
				log.error(
						"handleCheckoutSessionCompleted: Unrecognized product ID '{}' on subscription {} for tenant: {}; rejecting event to avoid silent misclassification",
						productId, subscription.getId(), tenantId);
				return;
			}

			tenant.setSubscriptionStatus(mapStripeStatusToSubscriptionStatus(subscription));
			if (tenant.getTenantStatus() == TenantStatus.FREE_TRAIL_ENDED
					|| tenant.getTenantStatus() == TenantStatus.TRIAL_ENDED_USER_LIMIT_EXCEEDED
					|| tenant.getTenantStatus() == TenantStatus.SUBSCRIPTION_CANCELED_USER_LIMIT_EXCEEDED) {
				tenant.setTenantStatus(TenantStatus.ACTIVE);
			}

			if (subscription.getItems() != null && !subscription.getItems().getData().isEmpty()) {
				String priceId = subscription.getItems().getData().getFirst().getPrice().getId();
				SubscriptionPlan plan = stripeService.getSubscriptionPlanFromPriceId(priceId);
				tenant.setSubscriptionPlan(plan);
			}

			tenant.setLastModifiedDate(Instant.now());
			tenant.setBillingEmail(billingEmail);
			tenant.setStripeSubscription(stripeSubscription);

			tenantDao.save(tenant);

			tenantContext.setTenantAndSwitchSchema(tenant.getTenantName());

			dashboardEmailService.sendNewOrganizationStartedSkappCoreFreeTrialEmail(tenantId,
					tenant.getStripeSubscription().getLastModifiedByEmail());

			systemVersionService.upgradeSystemVersion(VersionType.MAJOR,
					SystemVersionTypes.TIER_CHANGE_FROM_FREE_TO_PRO);
			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

			String trialEndDate = DateTimeUtils.epochSecondToUtcLocalDate(subscription.getTrialEnd()).toString();

			stripeEmailService.sendWelcomeToSkappProFreeTrialEmail(billingEmail, trialEndDate, tenant.getTenantName());

			log.info("handleCheckoutSessionCompleted: Successfully saved subscription details for tenant: {}",
					tenantId);
		}
		catch (StripeException e) {
			log.error("handleCheckoutSessionCompleted: StripeException occurred", e);
			throw new StripeVerificationException(
					EPCommonMessageConstant.EP_COMMON_ERROR_HANDLE_CHECKOUT_SESSION_COMPLETED, event,
					StripeWebhookEventTypes.CHECKOUT_SESSION_COMPLETED);
		}
	}

	private void handleSubscriptionPaymentSucceeded(Event event) {
		log.info("handleSubscriptionPaymentSucceeded: Handling subscription payment succeeded event");

		try {
			Invoice invoice = event.getDataObjectDeserializer()
				.getObject()
				.filter(Invoice.class::isInstance)
				.map(Invoice.class::cast)
				.orElse(null);

			if (invoice == null) {
				log.error("handleSubscriptionPaymentSucceeded: Failed to deserialize invoice from event");
				return;
			}

			String customerId = invoice.getCustomer();
			String userEmail = invoice.getCustomerEmail();

			InvoiceUpcomingParams params = InvoiceUpcomingParams.builder()
				.setSubscription(invoice.getSubscription())
				.build();

			Invoice upcomingInvoice = Invoice.upcoming(params);

			String nextBillDate = DateTimeUtils.epochSecondToUtcLocalDate(upcomingInvoice.getCreated()).toString();
			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
			StripeSubscription currentTenant = stripeSubscriptionDao.findByCustomerId(customerId);
			if (currentTenant == null) {
				return;
			}

			if ((currentTenant.getTenant().getSubscriptionStatus() == SubscriptionStatus.FREE_TRIAL
					|| currentTenant.getTenant().getSubscriptionStatus() == SubscriptionStatus.CANCELED)
					&& invoice.getBillingReason().equals("subscription_cycle") && invoice.getStatus().equals("paid")) {

				Subscription subscription = Subscription.retrieve(currentTenant.getSubscriptionId());

				if (subscription.getItems() == null || subscription.getItems().getData().isEmpty()) {
					log.error(
							"handleSubscriptionPaymentSucceeded: Subscription {} has no line items; cannot determine tier for tenant: {}",
							subscription.getId(), currentTenant.getTenantName());
					return;
				}

				String productId = subscription.getItems().getData().getFirst().getPrice().getProduct();

				if (productId == null) {
					log.error(
							"handleSubscriptionPaymentSucceeded: Product ID is null on subscription {} for tenant: {}; cannot determine tier",
							subscription.getId(), currentTenant.getTenantName());
					return;
				}

				currentTenant.getTenant().setSubscriptionStatus(SubscriptionStatus.ACTIVE);
				currentTenant.setLastModifiedByEmail(userEmail);
				currentTenant.getTenant().setLastModifiedDate(Instant.now());

				if (stripeProProductId.equals(productId)) {
					currentTenant.getTenant().setTier(Tier.PRO);
				}
				else if (stripeCoreProductId.equals(productId)) {
					currentTenant.getTenant().setTier(Tier.CORE);
				}
				else {
					log.error(
							"handleSubscriptionPaymentSucceeded: Unrecognized product ID '{}' on subscription {} for tenant: {}; rejecting event to avoid silent misclassification",
							productId, subscription.getId(), currentTenant.getTenantName());
					return;
				}

				tenantDao.save(currentTenant.getTenant());

				tenantContext.setTenantAndSwitchSchema(currentTenant.getTenantName());

				dashboardEmailService.sendTrialOrganizationConvertedToSkappCoreSubscriptionEmail(
						currentTenant.getTenant().getTenantName(),
						currentTenant.getTenant().getStripeSubscription().getLastModifiedByEmail());

				systemVersionService.upgradeSystemVersion(VersionType.MAJOR,
						SystemVersionTypes.TIER_CHANGE_FROM_FREE_TO_PRO);
				tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

				stripeEmailService.sendCongratulationsOnUpgradingToSkappProMail(userEmail, nextBillDate,
						currentTenant.getTenantName());
			}

			log.info("handleSubscriptionPaymentSucceeded: Successfully sent subscription payment succeeded email");
		}
		catch (StripeException e) {
			log.error("handleSubscriptionPaymentSucceeded: StripeException occurred", e);
			throw new StripeVerificationException(
					EPCommonMessageConstant.EP_COMMON_ERROR_HANDLE_SUBSCRIPTION_PAYMENT_SUCCEEDED, event,
					StripeWebhookEventTypes.INVOICE_PAYMENT_SUCCEEDED);
		}
	}

	private void handleSubscriptionPaymentFail(Event event) {
		log.info("handleSubscriptionPaymentFail: Handling subscription payment fail event");

		try {
			Invoice invoice = event.getDataObjectDeserializer()
				.getObject()
				.filter(Invoice.class::isInstance)
				.map(Invoice.class::cast)
				.orElse(null);

			if (invoice == null) {
				log.error("handleSubscriptionPaymentFail: Failed to deserialize invoice from event");
				return;
			}

			invoice = Invoice.retrieve(invoice.getId());
			StripeSubscription currentTenant = stripeSubscriptionDao.findByCustomerId(invoice.getCustomer());

			if (currentTenant == null) {
				log.error("handleSubscriptionPaymentFail: No subscription found for customer: {}",
						invoice.getCustomer());
				return;
			}

			Tenant tenant = currentTenant.getTenant();
			String tenantName = tenant.getTenantName();
			int attemptCount = invoice.getAttemptCount().intValue();

			if (attemptCount == 1 && tenant.getSubscriptionStatus() == SubscriptionStatus.FREE_TRIAL
					|| attemptCount == 4) {

				tenant.setSubscriptionStatus(SubscriptionStatus.CANCELED);
				tenantContext.setTenantAndSwitchSchema(tenantName);
				long employeeCount = employeeDao
					.countByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));
				tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

				tenant.setTier(Tier.FREE);
				if (attemptCount == 1) {
					tenant.setTenantStatus(TenantStatus.FREE_TRAIL_ENDED);
					Subscription subscription = Subscription.retrieve(currentTenant.getSubscriptionId());
					subscription.cancel();
				}

				SystemVersionTypes systemVersionTypes = SystemVersionTypes.TIER_CHANGE_FROM_PRO_TO_FREE;

				int maxUserLimit = specialTenantConfig.getMaxEmployeeCountForTenant(tenantName);
				if (employeeCount > maxUserLimit) {
					tenant.setTenantStatus(attemptCount == 1 ? TenantStatus.TRIAL_ENDED_USER_LIMIT_EXCEEDED
							: TenantStatus.SUBSCRIPTION_CANCELED_USER_LIMIT_EXCEEDED);
					systemVersionTypes = SystemVersionTypes.TIER_CHANGE_TO_SUSPENDED_FOR_UNPAID;
				}

				tenant.setLastModifiedDate(Instant.now());
				currentTenant.setLastModifiedByEmail(invoice.getCustomerEmail());

				tenantDao.save(tenant);
				tenantContext.setTenantAndSwitchSchema(tenantName);
				systemVersionService.upgradeSystemVersion(VersionType.MAJOR, systemVersionTypes);
				tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

				log.info("handleSubscriptionPaymentFail: Updated tenant status to UNPAID for tenant: {}", tenantName);
			}

			log.info("handleSubscriptionPaymentFail: Successfully sent payment failure email");

		}
		catch (StripeException e) {
			log.error("handleSubscriptionPaymentFail: StripeException occurred", e);
			throw new StripeVerificationException(
					EPCommonMessageConstant.EP_COMMON_ERROR_HANDLE_SUBSCRIPTION_PAYMENT_FAILED, event,
					StripeWebhookEventTypes.INVOICE_PAYMENT_FAIL);
		}
	}

	private void handleSubscriptionCancelled(Event event) {
		log.info("handleSubscriptionCancelled: Handling subscription cancelled event");

		try {
			Subscription subscription = event.getDataObjectDeserializer()
				.getObject()
				.filter(Subscription.class::isInstance)
				.map(Subscription.class::cast)
				.orElse(null);

			if (subscription == null) {
				log.error("handleSubscriptionCancelled: Failed to deserialize subscription from event");
				return;
			}

			String customerId = subscription.getCustomer();
			StripeSubscription stripeSubscription = stripeSubscriptionDao.findByCustomerId(customerId);
			if (stripeSubscription == null) {
				log.error("handleSubscriptionCancelled: No subscription found for customer: {}", customerId);
				return;
			}

			Tenant tenant = stripeSubscription.getTenant();
			String tenantName = tenant.getTenantName();
			tenantContext.setTenantAndSwitchSchema(tenantName);
			long employeeCount = employeeDao
				.countByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));
			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

			tenant.setTier(Tier.FREE);
			if (tenant.getSubscriptionStatus() == SubscriptionStatus.FREE_TRIAL) {
				tenant.setTenantStatus(TenantStatus.FREE_TRAIL_ENDED);
			}

			SystemVersionTypes systemVersionTypes = SystemVersionTypes.TIER_CHANGE_FROM_PRO_TO_FREE;
			int maxUserLimit = specialTenantConfig.getMaxEmployeeCountForTenant(tenantName);
			if (employeeCount > maxUserLimit) {
				tenant.setTenantStatus(TenantStatus.SUBSCRIPTION_CANCELED_USER_LIMIT_EXCEEDED);
				systemVersionTypes = SystemVersionTypes.TIER_CHANGE_TO_SUSPENDED_FOR_CANCELLED;
			}
			else {
				tenantContext.setTenantAndSwitchSchema(tenantName);
				epRolesService.downgradeUserRolesToEmployeeRole();
				tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
			}

			tenant.setSubscriptionStatus(SubscriptionStatus.CANCELED);
			tenant.setLastModifiedDate(Instant.now());

			Customer customer = Customer.retrieve(customerId);
			tenant.setLastModifiedByEmail(customer.getEmail());

			tenantDao.save(tenant);

			tenantContext.setTenantAndSwitchSchema(tenantName);

			systemVersionService.upgradeSystemVersion(VersionType.MAJOR, systemVersionTypes);
			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

			log.info(
					"handleSubscriptionCancelled: Successfully updated tenant subscription status to CANCELLED for tenant: {}",
					tenant.getTenantName());
		}
		catch (StripeException e) {
			log.error("handleSubscriptionCancelled: StripeException occurred", e);
			throw new StripeVerificationException(EPCommonMessageConstant.EP_COMMON_ERROR_HANDLE_SUBSCRIPTION_CANCELLED,
					event, StripeWebhookEventTypes.CUSTOMER_SUBSCRIPTION_DELETED);
		}
	}

	private void handleSubscriptionUpdated(Event event) {
		log.info("handleSubscriptionUpdated: Handling subscription updated event");

		try {
			Subscription subscription = event.getDataObjectDeserializer()
				.getObject()
				.filter(Subscription.class::isInstance)
				.map(Subscription.class::cast)
				.orElse(null);

			if (subscription == null) {
				log.error("handleSubscriptionUpdated: Failed to deserialize subscription from event");
				return;
			}

			String customerId = subscription.getCustomer();
			StripeSubscription stripeSubscription = stripeSubscriptionDao.findByCustomerId(customerId);
			if (stripeSubscription == null) {
				log.error("handleSubscriptionUpdated: No subscription found for customer: {}", customerId);
				return;
			}

			Tenant tenant = stripeSubscription.getTenant();

			if (subscription.getItems() != null && !subscription.getItems().getData().isEmpty()) {
				String priceId = subscription.getItems().getData().getFirst().getPrice().getId();
				SubscriptionPlan newPlan = stripeService.getSubscriptionPlanFromPriceId(priceId);

				if (tenant.getSubscriptionPlan() != newPlan) {
					tenant.setSubscriptionPlan(newPlan);
					log.info("handleSubscriptionUpdated: Plan changed to {} for tenant: {}", newPlan,
							tenant.getTenantName());
				}
			}

			tenantDao.save(tenant);

			Customer customer = Customer.retrieve(customerId);
			String endDate = DateTimeUtils.epochSecondToUtcLocalDate(subscription.getCurrentPeriodEnd()).toString();

			if (subscription.getCancellationDetails() != null
					&& subscription.getCancellationDetails().getReason() != null
					&& StripeSubscriptionType.CANCELLATION_REQUESTED.getType()
						.equals(subscription.getCancellationDetails().getReason())) {

				stripeEmailService.sendCancelSubscriptionEmail(customer.getEmail(), endDate, tenant.getTenantName());

				tenantContext.setTenantAndSwitchSchema(tenant.getTenantName());

				dashboardEmailService.sendOrganizationCancelledSkappCoreSubscriptionEmail(tenant.getTenantName(),
						tenant.getStripeSubscription().getLastModifiedByEmail());

				tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
			}

			log.info("handleSubscriptionUpdated: Successfully updated subscription details for tenant: {}",
					tenant.getTenantName());
		}
		catch (StripeException e) {
			log.error("handleSubscriptionUpdated: StripeException occurred", e);
			throw new StripeVerificationException(EPCommonMessageConstant.EP_COMMON_ERROR_HANDLE_SUBSCRIPTION_UPDATED,
					event, StripeWebhookEventTypes.CUSTOMER_SUBSCRIPTION_UPDATED);
		}
	}

	private SubscriptionStatus mapStripeStatusToSubscriptionStatus(Subscription subscription) {
		String status = subscription.getStatus();

		return switch (status) {
			case "active" -> SubscriptionStatus.ACTIVE;
			case "past_due" -> SubscriptionStatus.PAST_DUE;
			case "unpaid" -> SubscriptionStatus.UNPAID;
			case "canceled" -> SubscriptionStatus.CANCELED;
			case "trialing" -> SubscriptionStatus.FREE_TRIAL;
			default -> null;
		};
	}

}
