package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.StripeSubscription;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.payload.request.SubscriptionDetailsResponseDto;
import com.skapp.enterprise.common.payload.request.SubscriptionRequestDto;
import com.skapp.enterprise.common.payload.request.UpdateSubscriptionRequestDto;
import com.skapp.enterprise.common.payload.response.SubscriptionResponseDto;
import com.skapp.enterprise.common.service.StripeService;
import com.skapp.enterprise.common.service.TenantService;
import com.skapp.enterprise.common.type.SubscriptionPlan;
import com.skapp.enterprise.common.type.SubscriptionStatus;
import com.skapp.enterprise.common.type.Tier;
import com.stripe.exception.StripeException;
import com.stripe.model.Price;
import com.stripe.model.PriceCollection;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.param.PriceListParams;
import com.stripe.param.SubscriptionUpdateParams;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.EnumMap;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class StripeServiceImpl implements StripeService {

	private final TenantContext tenantContext;

	private final TenantDao tenantDao;

	private final UserService userService;

	private final TenantService tenantService;

	@Value("${stripe.product.product-id}")
	private String stripeProductId;

	@Value("${stripe.trial.days}")
	private Long trialPeriodDays;

	@Value("${aws.route53.parent-domain}")
	private String parentDomain;

	@Override
	public ResponseEntityDto getSubscriptionDetails() throws StripeException {
		Tenant tenant = tenantService.getCurrentTenantFromSwitchingSchemas();
		SubscriptionDetailsResponseDto responseDto = new SubscriptionDetailsResponseDto();

		responseDto.setTier(tenant.getTier() != null ? tenant.getTier() : Tier.FREE);

		if (tenant.getStripeSubscription() == null) {
			return new ResponseEntityDto(false, responseDto);
		}

		Subscription subscription = Subscription.retrieve(tenant.getStripeSubscription().getSubscriptionId());
		Long subscriptionQuantity = tenant.getSubscriptionQuantity() != null ? tenant.getSubscriptionQuantity() : 0;

		responseDto.setCustomerId(tenant.getStripeSubscription().getCustomerId());
		responseDto.setSubscriptionId(subscription.getId());
		responseDto.setSubscriptionPlan(tenant.getSubscriptionPlan());
		responseDto.setSubscriptionQuantity(subscriptionQuantity);
		responseDto.setSubscriptionStatus(tenant.getSubscriptionStatus());

		return getSubscriptionDetailsResponseEntityDto(responseDto, subscription, subscription.getTrialEnd());
	}

	private ResponseEntityDto getSubscriptionDetailsResponseEntityDto(SubscriptionDetailsResponseDto responseDto,
			Subscription subscription, Long trialEnd) {
		responseDto.setTotalCost(subscription.getItems()
			.getData()
			.stream()
			.mapToDouble(item -> (item.getPrice().getUnitAmount() / 100.0)
					* (item.getQuantity() != null ? item.getQuantity() : 1))
			.sum());

		responseDto.setNextBillingDate(subscription.getCurrentPeriodEnd() != null
				? Instant.ofEpochSecond(subscription.getCurrentPeriodEnd()) : null);

		if (trialEnd != null) {
			long remainingDays = ChronoUnit.DAYS.between(LocalDate.now(),
					Instant.ofEpochSecond(trialEnd).atOffset(ZoneOffset.UTC).toLocalDate());
			responseDto.setTrialExpiredRemainingDays(Math.max(remainingDays, 0));
			responseDto.setTrialEndDate(Instant.ofEpochSecond(trialEnd));
		}

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto getPricingPlans() throws StripeException {
		Map<SubscriptionPlan, Double> priceMap = getPriceValueMap();
		return new ResponseEntityDto(false, priceMap);

	}

	@Override
	public ResponseEntityDto createCheckoutSession(SubscriptionRequestDto subscriptionRequestDto)
			throws StripeException {
		String tenantId = TenantContext.getCurrentTenant();

		Tenant tenant = tenantService.getCurrentTenantFromSwitchingSchemas();

		if (tenant.getStripeSubscription() != null && tenant.getStripeSubscription().getCustomerId() != null
				&& tenant.getTier() != Tier.FREE) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_ALREADY_EXISTS);
		}

		SessionCreateParams.Builder builder = new SessionCreateParams.Builder()
			.setMode(SessionCreateParams.Mode.SUBSCRIPTION)
			.setSuccessUrl("https://" + tenantId + "." + parentDomain
					+ "/settings/account-settings?session_id={CHECKOUT_SESSION_ID}")
			.setCancelUrl("https://" + tenantId + "." + parentDomain + "/settings/account-settings")
			.setClientReferenceId(UUID.randomUUID().toString())
			.setBillingAddressCollection(SessionCreateParams.BillingAddressCollection.REQUIRED)
			.setPaymentMethodCollection(SessionCreateParams.PaymentMethodCollection.ALWAYS)
			.setAllowPromotionCodes(true)
			.setLocale(SessionCreateParams.Locale.AUTO);

		builder.putMetadata(EpAuthConstants.TENANT_ID, tenantId);

		Map<SubscriptionPlan, String> priceMap = getPriceMap();
		String priceId = subscriptionRequestDto.getSubscriptionPlan() == SubscriptionPlan.MONTH
				? priceMap.get(SubscriptionPlan.MONTH) : priceMap.get(SubscriptionPlan.YEAR);

		SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
			.setQuantity(subscriptionRequestDto.getQuantity())
			.setPrice(priceId)
			.build();

		builder.addLineItem(lineItem);

		SessionCreateParams.SubscriptionData subscriptionData = SessionCreateParams.SubscriptionData.builder()
			.setTrialPeriodDays(trialPeriodDays)
			.build();

		builder.setSubscriptionData(subscriptionData);

		SessionCreateParams params = builder.build();
		Session session = Session.create(params);

		SubscriptionResponseDto subscriptionResponseDto = new SubscriptionResponseDto();
		subscriptionResponseDto.setSessionUrl(session.getUrl());

		return new ResponseEntityDto(false, subscriptionResponseDto);
	}

	@Override
	public ResponseEntityDto createCustomerPortalSession() throws StripeException {
		String tenantId = TenantContext.getCurrentTenant();

		Tenant tenant = tenantService.getCurrentTenantFromSwitchingSchemas();

		if (tenant.getStripeSubscription() == null || tenant.getStripeSubscription().getCustomerId() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_NOT_FOUND);
		}

		String customerId = tenant.getStripeSubscription().getCustomerId();

		com.stripe.param.billingportal.SessionCreateParams params = com.stripe.param.billingportal.SessionCreateParams
			.builder()
			.setCustomer(customerId)
			.setReturnUrl("https://" + tenantId + "." + parentDomain + "/settings/account-settings")
			.build();

		com.stripe.model.billingportal.Session portalSession = com.stripe.model.billingportal.Session.create(params);

		SubscriptionResponseDto subscriptionResponseDto = new SubscriptionResponseDto();
		subscriptionResponseDto.setSessionUrl(portalSession.getUrl());

		return new ResponseEntityDto(false, subscriptionResponseDto);
	}

	@Override
	public ResponseEntityDto updateSubscription(UpdateSubscriptionRequestDto updateSubscriptionRequestDto)
			throws StripeException {
		String currentTenant = TenantContext.getCurrentTenant();
		User currentUser = userService.getCurrentUser();

		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		Tenant tenant = tenantDao.findByTenantName(currentTenant);

		if (tenant.getStripeSubscription() == null || tenant.getStripeSubscription().getSubscriptionId() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_NOT_FOUND);
		}

		String subscriptionId = tenant.getStripeSubscription().getSubscriptionId();
		Subscription subscription = Subscription.retrieve(subscriptionId);

		if (SubscriptionStatus.CANCELED.getStatus().equals(subscription.getStatus())) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_CANCELED);
		}

		Map<SubscriptionPlan, String> priceMap = getPriceMap();
		String subscriptionItemId = subscription.getItems().getData().getFirst().getId();

		SubscriptionUpdateParams.Item item;
		if (updateSubscriptionRequestDto.getSubscriptionPlan() != null
				&& !updateSubscriptionRequestDto.getSubscriptionPlan().equals(tenant.getSubscriptionPlan())) {

			String newPriceId = updateSubscriptionRequestDto.getSubscriptionPlan() == SubscriptionPlan.MONTH
					? priceMap.get(SubscriptionPlan.MONTH) : priceMap.get(SubscriptionPlan.YEAR);

			item = SubscriptionUpdateParams.Item.builder()
				.setId(subscriptionItemId)
				.setQuantity(updateSubscriptionRequestDto.getSubscriptionQuantity())
				.setPrice(newPriceId)
				.build();
		}
		else {
			item = SubscriptionUpdateParams.Item.builder()
				.setId(subscriptionItemId)
				.setQuantity(updateSubscriptionRequestDto.getSubscriptionQuantity())
				.build();
		}

		SubscriptionUpdateParams params = SubscriptionUpdateParams.builder()
			.addItem(item)
			.setProrationBehavior(SubscriptionUpdateParams.ProrationBehavior.ALWAYS_INVOICE)
			.build();

		Subscription updatedSubscription = subscription.update(params);

		tenant.setSubscriptionQuantity(updateSubscriptionRequestDto.getSubscriptionQuantity());
		if (updateSubscriptionRequestDto.getSubscriptionPlan() != null) {
			tenant.setSubscriptionPlan(updateSubscriptionRequestDto.getSubscriptionPlan());
		}
		tenant.setLastModifiedDate(Instant.now());
		tenant.setLastModifiedByEmail(currentUser.getEmail());

		StripeSubscription stripeSubscription = tenant.getStripeSubscription();
		stripeSubscription.setLastModifiedByEmail(currentUser.getEmail());
		stripeSubscription.setLastModifiedDate(Instant.now());

		tenant.setStripeSubscription(stripeSubscription);
		tenantDao.save(tenant);

		tenantContext.setTenantAndSwitchSchema(currentTenant);

		SubscriptionDetailsResponseDto responseDto = getSubscriptionDetailsResponseDto(tenant, updatedSubscription);

		return getSubscriptionDetailsResponseEntityDto(responseDto, updatedSubscription, subscription.getTrialEnd());
	}

	private SubscriptionDetailsResponseDto getSubscriptionDetailsResponseDto(Tenant tenant,
			Subscription updatedSubscription) {
		SubscriptionDetailsResponseDto responseDto = new SubscriptionDetailsResponseDto();
		responseDto.setCustomerId(tenant.getStripeSubscription().getCustomerId());
		responseDto.setSubscriptionId(updatedSubscription.getId());
		responseDto.setTier(tenant.getTier());
		responseDto.setSubscriptionPlan(tenant.getSubscriptionPlan());
		responseDto.setSubscriptionStatus(tenant.getSubscriptionStatus());
		responseDto.setSubscriptionQuantity(updatedSubscription.getItems().getData().getFirst().getQuantity());
		return responseDto;
	}

	private Map<SubscriptionPlan, String> getPriceMap() throws StripeException {
		PriceListParams params = PriceListParams.builder().setProduct(stripeProductId).setActive(true).build();
		PriceCollection prices = Price.list(params);
		Map<SubscriptionPlan, String> priceMap = new EnumMap<>(SubscriptionPlan.class);
		for (Price price : prices.getData()) {
			if (price.getRecurring() != null) {
				SubscriptionPlan plan = SubscriptionPlan.valueOf(price.getRecurring().getInterval().toUpperCase());
				priceMap.put(plan, price.getId());
			}
		}
		return priceMap;
	}

	private Map<SubscriptionPlan, Double> getPriceValueMap() throws StripeException {
		PriceListParams params = PriceListParams.builder().setProduct(stripeProductId).setActive(true).build();
		PriceCollection prices = Price.list(params);
		Map<SubscriptionPlan, Double> priceMap = new EnumMap<>(SubscriptionPlan.class);
		for (Price price : prices.getData()) {
			if (price.getRecurring() != null) {
				SubscriptionPlan plan = SubscriptionPlan.valueOf(price.getRecurring().getInterval().toUpperCase());
				Double unitAmount = price.getUnitAmount() / 100.0;
				priceMap.put(plan, unitAmount);
			}
		}
		return priceMap;
	}

	public SubscriptionPlan getSubscriptionPlanFromPriceId(String priceId) throws StripeException {
		Price price = Price.retrieve(priceId);

		if (price.getRecurring() != null) {
			String interval = price.getRecurring().getInterval();
			return SubscriptionPlan.valueOf(interval.toUpperCase());
		}

		log.warn("Could not determine subscription plan for price ID: {}", priceId);
		return SubscriptionPlan.MONTH;
	}

}
