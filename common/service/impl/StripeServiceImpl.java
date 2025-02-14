package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.mapper.CommonMapper;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
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

	private final CommonMapper commonMapper;

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
		if (tenant.getStripeSubscription().getSubscriptionId() != null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_ALREADY_EXISTS);
		}

		tenant.setBillingEmail(subscriptionRequestDto.getBillingEmail());
		tenant.setSubscriptionPlan(subscriptionRequestDto.getSubscriptionPlan());
		tenant.setTier(Tier.PRO);
		tenant.setLastModifiedByEmail(currentUser.getEmail());
		tenant.setLastModifiedDate(Instant.now());
		tenant.setSubscriptionQuantity(subscriptionRequestDto.getSubscriptionQuantity());

		StripeSubscription stripeSubscription = tenant.getStripeSubscription();
		stripeSubscription.setCustomerId(subscriptionRequestDto.getCustomerId());
		stripeSubscription.setSubscriptionId(subscriptionRequestDto.getSubscriptionId());
		stripeSubscription.setSubscriptionStartDate(Instant.now());
		stripeSubscription.setCreatedByEmail(currentUser.getEmail());
		stripeSubscription.setCreatedDate(Instant.now());

		tenant.setStripeSubscription(stripeSubscription);
		tenantDao.save(tenant);

		CreateSubscriptionResponseDto responseDto = commonMapper.tenantToCreateSubscriptionResponseDto(tenant);

		log.info("Subscription created successfully {}", subscriptionRequestDto.getCustomerId());
		return new ResponseEntityDto(false, responseDto);
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
