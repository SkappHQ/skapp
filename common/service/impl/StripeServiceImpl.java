package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.exception.StripeVerificationException;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.StripeSubscription;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.payload.request.CreateSubscriptionRequestDto;
import com.skapp.enterprise.common.payload.request.CreateSubscriptionResponseDto;
import com.skapp.enterprise.common.payload.request.SubscriptionDetailsResponseDto;
import com.skapp.enterprise.common.service.StripeService;
import com.skapp.enterprise.common.type.StripeWebhookEventTypes;
import com.skapp.enterprise.common.type.SubscriptionStatus;
import com.skapp.enterprise.common.type.Tier;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.Subscription;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@Slf4j
@RequiredArgsConstructor
public class StripeServiceImpl implements StripeService {

	private final TenantContext tenantContext;

	private final TenantDao tenantDao;

	private final UserService userService;

	@Value("${stripe.webhook-secret}")
	private String webhookSecret;

	@Override
	public void handleStripeEvent(String payload, String sigHeader) throws SignatureVerificationException {
		log.info("Received Stripe webhook event");

		Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

		log.info("Processing Stripe event type: {}", event.getType());

		if (event.getType().equals(StripeWebhookEventTypes.CUSTOMER_SUBSCRIPTION_CREATED.getEventType())) {
			handleSubscriptionCreated(event);
		}
	}

	@Override
	public ResponseEntityDto createSubscription(CreateSubscriptionRequestDto subscriptionRequestDto) {
		log.info("Creating subscription for customer: {}", subscriptionRequestDto.getCustomerId());

		String currentTenant = TenantContext.getCurrentTenant();
		User currentUser = userService.getCurrentUser();
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

		Tenant tenant = tenantDao.findByTenantName(currentTenant);
		if (tenant.getStripeSubscription() != null && tenant.getStripeSubscription().getSubscriptionId() != null
				&& tenant.getTier() != Tier.FREE) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_ALREADY_EXISTS);
		}

		prepareTenantForSubscription(tenant, subscriptionRequestDto, currentUser, currentTenant);

		CreateSubscriptionResponseDto responseDto = new CreateSubscriptionResponseDto();
		responseDto.setCustomerId(subscriptionRequestDto.getCustomerId());
		responseDto.setSubscriptionId(subscriptionRequestDto.getSubscriptionId());

		log.info("Subscription created successfully {}", subscriptionRequestDto.getCustomerId());
		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto getSubscriptionDetails() {
		SubscriptionDetailsResponseDto responseDto = new SubscriptionDetailsResponseDto();

		String currentTenant = TenantContext.getCurrentTenant();
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		Tenant tenant = tenantDao.findByTenantName(currentTenant);
		tenantContext.setTenantAndSwitchSchema(currentTenant);

		responseDto.setTier(tenant.getTier() != null ? tenant.getTier() : Tier.FREE);
		if (tenant.getStripeSubscription() != null) {
			responseDto.setCustomerId(tenant.getStripeSubscription().getCustomerId());
			responseDto.setSubscriptionId(tenant.getStripeSubscription().getSubscriptionId());
			responseDto.setSubscriptionPlan(tenant.getSubscriptionPlan());

			if (tenant.getSubscriptionQuantity() != null) {
				responseDto.setSubscriptionQuantity(tenant.getSubscriptionQuantity());
			}
		}

		return new ResponseEntityDto(false, responseDto);
	}

	private void prepareTenantForSubscription(Tenant tenant, CreateSubscriptionRequestDto subscriptionRequestDto,
			User currentUser, String currentTenant) {
		tenant.setBillingEmail(subscriptionRequestDto.getBillingEmail());
		tenant.setSubscriptionPlan(subscriptionRequestDto.getSubscriptionPlan());
		tenant.setTier(Tier.PRO);
		tenant.setLastModifiedByEmail(currentUser.getEmail());
		tenant.setLastModifiedDate(Instant.now());
		tenant.setSubscriptionQuantity(subscriptionRequestDto.getSubscriptionQuantity());
		tenant.setSubscriptionStatus(SubscriptionStatus.PENDING);

		StripeSubscription stripeSubscription = new StripeSubscription();
		stripeSubscription.setTenantName(currentTenant);
		stripeSubscription.setCustomerId(subscriptionRequestDto.getCustomerId());
		stripeSubscription.setSubscriptionId(subscriptionRequestDto.getSubscriptionId());
		stripeSubscription.setSubscriptionStartDate(Instant.now());
		stripeSubscription.setCreatedByEmail(currentUser.getEmail());
		stripeSubscription.setCreatedDate(Instant.now());
		stripeSubscription.setTenant(tenant);

		tenant.setStripeSubscription(stripeSubscription);

		tenantDao.save(tenant);
	}

	private void handleSubscriptionCreated(Event event) {
		try {
			log.info("Handling subscription created event");
			StripeWebhookEventTypes eventType = StripeWebhookEventTypes.CUSTOMER_SUBSCRIPTION_CREATED;

			Subscription subscription = (Subscription) event.getDataObjectDeserializer().getObject().orElse(null);
			if (subscription == null) {
				throw new StripeVerificationException(EPCommonMessageConstant.STRIPE_ERROR_SUBSCRIPTION_NOT_FOUND,
						event, eventType);
			}

			String customerId = subscription.getCustomer();
			Customer customer = Customer.retrieve(customerId);
			String customerName = customer.getName();

			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
			Tenant tenant = tenantDao.findByTenantName(customerName);

			if (tenant == null) {
				throw new StripeVerificationException(EPCommonMessageConstant.STRIPE_ERROR_TENANT_NOT_FOUND, event,
						customerName, customerId, eventType, new String[] { customerName });
			}

			if (tenant.getStripeSubscription() == null) {
				throw new StripeVerificationException(EPCommonMessageConstant.STRIPE_ERROR_SUBSCRIPTION_NOT_FOUND,
						event, tenant.getTenantName(), customerName, customerId, eventType);
			}

			StripeSubscription existingSubscription = tenant.getStripeSubscription();
			if (!existingSubscription.getSubscriptionId().equals(subscription.getId())
					|| !existingSubscription.getCustomerId().equals(customerId)) {
				throw new StripeVerificationException(EPCommonMessageConstant.STRIPE_ERROR_SUBSCRIPTION_MISMATCH, event,
						tenant.getTenantName(), customerName, customerId, eventType);
			}

			log.info("Subscription verified successfully for customer: {}", customerName);
		}
		catch (StripeException e) {
			throw new StripeVerificationException(EPCommonMessageConstant.STRIPE_ERROR_VERIFICATION_FAILED, event,
					StripeWebhookEventTypes.CUSTOMER_SUBSCRIPTION_CREATED, new String[] { e.getMessage() });
		}
	}

}
