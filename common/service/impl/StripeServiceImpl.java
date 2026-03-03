package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.SystemVersionService;
import com.skapp.community.common.type.SystemVersionTypes;
import com.skapp.community.common.type.VersionType;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.payload.request.SubscriptionDetailsResponseDto;
import com.skapp.enterprise.common.payload.request.SubscriptionRequestDto;
import com.skapp.enterprise.common.payload.response.SubscriptionResponseDto;
import com.skapp.enterprise.common.service.StripeService;
import com.skapp.enterprise.common.service.TenantService;
import com.skapp.enterprise.common.type.SubscriptionPlan;
import com.skapp.enterprise.common.type.SubscriptionStatus;
import com.skapp.enterprise.common.type.TenantStatus;
import com.skapp.enterprise.common.type.Tier;
import com.stripe.exception.StripeException;
import com.stripe.model.Price;
import com.stripe.model.PriceCollection;
import com.stripe.model.Subscription;
import com.stripe.model.SubscriptionItem;
import com.stripe.model.checkout.Session;
import com.stripe.param.PriceListParams;
import com.stripe.param.SubscriptionUpdateParams;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.EnumMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class StripeServiceImpl implements StripeService {

	private final TenantService tenantService;

	private final EmployeeDao employeeDao;

	private final TenantDao tenantDao;

	private final TenantContext tenantContext;

	private final SystemVersionService systemVersionService;

	@Value("${stripe.product.core-product-id}")
	private String stripeCoreProductId;

	@Value("${stripe.product.pro-product-id}")
	private String stripeProProductId;

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

		if (tenant.getStripeSubscription().getSubscriptionId() != null) {
			Subscription subscription = Subscription.retrieve(tenant.getStripeSubscription().getSubscriptionId());
			responseDto.setSubscriptionId(subscription.getId());
			if (subscription.getCancelAt() != null) {
				responseDto.setCancellationDate(Instant.ofEpochSecond(subscription.getCancelAt()));
			}

			responseDto.setNextBillingDate(subscription.getCurrentPeriodEnd() != null
					? Instant.ofEpochSecond(subscription.getCurrentPeriodEnd()) : null);

			responseDto.setTotalCost(subscription.getItems()
				.getData()
				.stream()
				.mapToDouble(item -> (item.getPrice().getUnitAmount() / 100.0)
						* (item.getQuantity() != null ? item.getQuantity() : 1))
				.sum());

			Long trialEnd = subscription.getTrialEnd();
			if (trialEnd != null) {
				long remainingDays = ChronoUnit.DAYS.between(LocalDate.now(),
						Instant.ofEpochSecond(trialEnd).atOffset(ZoneOffset.UTC).toLocalDate());
				responseDto.setTrialExpiredRemainingDays(Math.max(remainingDays, 0));
				responseDto.setTrialEndDate(Instant.ofEpochSecond(trialEnd));
			}

			Long subscriptionQuantity = subscription.getItems()
				.getData()
				.stream()
				.map(SubscriptionItem::getQuantity)
				.findFirst()
				.orElse(1L);

			responseDto.setSubscriptionQuantity(subscriptionQuantity);
		}

		responseDto.setCustomerId(tenant.getStripeSubscription().getCustomerId());

		responseDto.setSubscriptionPlan(tenant.getSubscriptionPlan());
		responseDto.setSubscriptionStatus(tenant.getSubscriptionStatus());

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto getPricingPlans() throws StripeException {
		Map<SubscriptionPlan, Double> corePriceMap = getPriceValueMap(stripeCoreProductId);
		Map<SubscriptionPlan, Double> proPriceMap = getPriceValueMap(stripeProProductId);

		Map<Tier, Map<SubscriptionPlan, Double>> priceMap = new EnumMap<>(Tier.class);
		priceMap.put(Tier.CORE, corePriceMap);
		priceMap.put(Tier.PRO, proPriceMap);

		return new ResponseEntityDto(false, priceMap);

	}

	@Override
	public ResponseEntityDto getPricingPlansForTier(Tier tier) throws StripeException {
		String productId = tier == Tier.PRO ? stripeProProductId : stripeCoreProductId;

		Map<SubscriptionPlan, Double> priceMap = getPriceValueMap(productId);

		return new ResponseEntityDto(false, priceMap);
	}

	@Override
	public ResponseEntityDto createCheckoutSession(SubscriptionRequestDto subscriptionRequestDto)
			throws StripeException {
		if (subscriptionRequestDto.getSubscriptionPlan() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_REQUIRED_SUBSCRIPTION_PLAN);
		}

		if (subscriptionRequestDto.getSuccessUrl() == null || subscriptionRequestDto.getCancelUrl() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_REQUIRED_SUCCESS_CANCEL_URL);
		}

		String tenantId = TenantContext.getCurrentTenant();

		Tenant tenant = tenantService.getCurrentTenantFromSwitchingSchemas();

		if (tenant.getTier() != Tier.FREE && tenant.getSubscriptionStatus() != SubscriptionStatus.CANCELED) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_ALREADY_EXISTS);
		}

		boolean hadPreviousSubscription = tenant.getStripeSubscription() != null
				&& (tenant.getSubscriptionStatus() == SubscriptionStatus.CANCELED);

		SessionCreateParams.TaxIdCollection taxIdCollection = null;

		if (!hadPreviousSubscription) {
			taxIdCollection = SessionCreateParams.TaxIdCollection.builder().setEnabled(true).build();
		}

		SessionCreateParams.Builder builder = new SessionCreateParams.Builder()
			.setMode(SessionCreateParams.Mode.SUBSCRIPTION)
			.setSuccessUrl(subscriptionRequestDto.getSuccessUrl())
			.setCancelUrl(subscriptionRequestDto.getCancelUrl())
			.setClientReferenceId(UUID.randomUUID().toString())
			.setBillingAddressCollection(SessionCreateParams.BillingAddressCollection.AUTO)
			.setPaymentMethodCollection(SessionCreateParams.PaymentMethodCollection.ALWAYS)
			.setLocale(SessionCreateParams.Locale.AUTO)
			.setAllowPromotionCodes(true);

		if (taxIdCollection != null) {
			builder.setTaxIdCollection(taxIdCollection);
		}

		builder.putMetadata(EpAuthConstants.TENANT_ID, tenantId);

		if (hadPreviousSubscription) {
			builder.setCustomer(tenant.getStripeSubscription().getCustomerId());
		}

		String productId = subscriptionRequestDto.getTier() == Tier.PRO ? stripeProProductId : stripeCoreProductId;

		Map<SubscriptionPlan, String> priceMap = getPriceMap(productId);
		String priceId = subscriptionRequestDto.getSubscriptionPlan() == SubscriptionPlan.MONTH
				? priceMap.get(SubscriptionPlan.MONTH) : priceMap.get(SubscriptionPlan.YEAR);

		Long employeeCount = employeeDao.countByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));

		SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
			.setQuantity(employeeCount)
			.setPrice(priceId)
			.build();

		builder.addLineItem(lineItem);

		SessionCreateParams.SubscriptionData.Builder subscriptionDataBuilder = SessionCreateParams.SubscriptionData
			.builder();

		if (!hadPreviousSubscription) {
			subscriptionDataBuilder.setTrialPeriodDays(trialPeriodDays);
		}

		builder.setSubscriptionData(subscriptionDataBuilder.build());

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
			.setReturnUrl("https://" + tenantId + "." + parentDomain + "/settings/account")
			.build();

		com.stripe.model.billingportal.Session portalSession = com.stripe.model.billingportal.Session.create(params);

		SubscriptionResponseDto subscriptionResponseDto = new SubscriptionResponseDto();
		subscriptionResponseDto.setSessionUrl(portalSession.getUrl());

		return new ResponseEntityDto(false, subscriptionResponseDto);
	}

	@Transactional
	public void updateSubscriptionQuantity(Long quantity, boolean isIncrement, boolean isFromEmployeeBulk) {
		String currentTenant = TenantContext.getCurrentTenant();
		String subscriptionId;
		long newQuantity;
		Tenant tenant;

		try {
			long employeeCount = employeeDao
				.countByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));

			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
			tenant = tenantDao.findByTenantName(currentTenant);

			if (tenant.getStripeSubscription() == null || tenant.getStripeSubscription().getSubscriptionId() == null) {
				throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_NOT_FOUND);
			}

			subscriptionId = tenant.getStripeSubscription().getSubscriptionId();

			newQuantity = employeeCount;
			if (isFromEmployeeBulk) {
				newQuantity += isIncrement ? quantity : 0L;
			}

			Subscription subscription = Subscription.retrieve(subscriptionId);
			String subscriptionItemId = subscription.getItems().getData().getFirst().getId();

			SubscriptionUpdateParams params = SubscriptionUpdateParams.builder()
				.addItem(SubscriptionUpdateParams.Item.builder()
					.setId(subscriptionItemId)
					.setQuantity(newQuantity)
					.build())
				.build();

			subscription.update(params);
		}
		catch (StripeException e) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_UPDATE,
					new String[] { e.getMessage() });
		}
		finally {
			tenantContext.setTenantAndSwitchSchema(currentTenant);
		}
	}

	@Override
	public ResponseEntityDto activateTenantAfterFreeTrial() {
		String currentTenant = TenantContext.getCurrentTenant();
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		Tenant tenant = tenantDao.findByTenantName(currentTenant);

		if (tenant.getTenantStatus() != TenantStatus.FREE_TRAIL_ENDED) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TENANT_STATUS_NOT_FREE_TRIAL_ENDED);
		}

		tenant.setTenantStatus(TenantStatus.ACTIVE);
		tenantDao.save(tenant);

		tenantContext.setTenantAndSwitchSchema(currentTenant);

		systemVersionService.upgradeSystemVersion(VersionType.MAJOR,
				SystemVersionTypes.TENANT_STATUS_UPDATE_TO_ACTIVE_AFTER_TRIAL);

		return new ResponseEntityDto(false, "Free trial ended successfully");
	}

	private Map<SubscriptionPlan, String> getPriceMap(String productId) throws StripeException {
		PriceListParams params = PriceListParams.builder().setProduct(productId).setActive(true).build();
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

	private Map<SubscriptionPlan, Double> getPriceValueMap(String productId) throws StripeException {
		PriceListParams params = PriceListParams.builder().setProduct(productId).setActive(true).build();
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
