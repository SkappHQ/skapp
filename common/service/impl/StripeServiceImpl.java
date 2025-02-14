package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.StripeSubscriptionDao;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.StripeSubscription;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.payload.request.CreateSubscriptionRequestDto;
import com.skapp.enterprise.common.payload.request.CreateSubscriptionResponseDto;
import com.skapp.enterprise.common.service.StripeService;
import com.skapp.enterprise.common.type.Tier;
import com.stripe.exception.SignatureVerificationException;
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

	private final StripeSubscriptionDao stripeSubscriptionDao;

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

	@Override
	public ResponseEntityDto createSubscription(CreateSubscriptionRequestDto subscriptionRequestDto) {
		log.info("Creating subscription for customer: {}", subscriptionRequestDto.getCustomerId());

		String currentTenant = TenantContext.getCurrentTenant();
		User currentUser = userService.getCurrentUser();
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);

		Tenant tenant = tenantDao.findByTenantName(currentTenant);
		if (tenant.getStripeSubscription() != null && tenant.getStripeSubscription().getSubscriptionId() != null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_ALREADY_EXISTS);
		}

		tenant.setBillingEmail(subscriptionRequestDto.getBillingEmail());
		tenant.setSubscriptionPlan(subscriptionRequestDto.getSubscriptionPlan());
		tenant.setTier(Tier.PRO);
		tenant.setLastModifiedByEmail(currentUser.getEmail());
		tenant.setLastModifiedDate(Instant.now());
		tenant.setSubscriptionQuantity(subscriptionRequestDto.getSubscriptionQuantity());

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

		CreateSubscriptionResponseDto responseDto = new CreateSubscriptionResponseDto();
		responseDto.setCustomerId(subscriptionRequestDto.getCustomerId());
		responseDto.setSubscriptionId(subscriptionRequestDto.getSubscriptionId());

		log.info("Subscription created successfully {}", subscriptionRequestDto.getCustomerId());
		return new ResponseEntityDto(false, responseDto);
	}

	private void handleSubscriptionCreated(Event event) {
		log.info("Handling subscription created event");

		Subscription subscription = (Subscription) event.getDataObjectDeserializer()
			.getObject()
			.filter(obj -> obj instanceof Subscription)
			.orElse(null);

		if (subscription != null) {
			StripeSubscription stripeSubscription = stripeSubscriptionDao.findBySubscriptionId(subscription.getId());
			if (stripeSubscription != null) {
				log.info("Subscription already exists in the system");
			}
		}
	}

}
