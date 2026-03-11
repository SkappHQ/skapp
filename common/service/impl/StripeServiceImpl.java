package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.SystemVersionService;
import com.skapp.community.common.type.SystemVersionTypes;
import com.skapp.community.common.type.VersionType;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.peopleplanner.repository.EmployeeDao;
import com.skapp.community.peopleplanner.type.AccountStatus;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.StripeSubscriptionHistoryDao;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.StripeSubscriptionHistory;
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
import com.stripe.model.Subscription;
import com.stripe.model.SubscriptionItem;
import com.stripe.model.checkout.Session;
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
import java.util.List;
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

	private final StripeSubscriptionHistoryDao stripeSubscriptionHistoryDao;

	@Value("${stripe.prices.core-monthly-price-id}")
	private String stripeCoreMonthlyPriceId;

	@Value("${stripe.prices.core-yearly-price-id}")
	private String stripeCoreYearlyPriceId;

	@Value("${stripe.prices.pro-monthly-price-id}")
	private String stripeProMonthlyPriceId;

	@Value("${stripe.prices.pro-yearly-price-id}")
	private String stripeProYearlyPriceId;

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
			responseDto.setUsedTrials(getUsedTrials(tenant.getTenantName()));
			return new ResponseEntityDto(false, responseDto);
		}

		if (tenant.getStripeSubscription().getSubscriptionId() != null) {
			Subscription subscription = Subscription.retrieve(tenant.getStripeSubscription().getSubscriptionId());
			responseDto.setSubscriptionId(subscription.getId());
			if (subscription.getCancelAt() != null) {
				responseDto.setCancellationDate(DateTimeUtils.epochSecondToInstant(subscription.getCancelAt()));
			}

			responseDto.setNextBillingDate(subscription.getCurrentPeriodEnd() != null
					? DateTimeUtils.epochSecondToInstant(subscription.getCurrentPeriodEnd()) : null);

			responseDto.setTotalCost(subscription.getItems()
				.getData()
				.stream()
				.mapToDouble(item -> (item.getPrice().getUnitAmount() / 100.0)
						* (item.getQuantity() != null ? item.getQuantity() : 1))
				.sum());

			Long trialEnd = subscription.getTrialEnd();
			if (trialEnd != null) {
				long remainingDays = ChronoUnit.DAYS.between(LocalDate.now(),
							DateTimeUtils.epochSecondToUtcLocalDate(trialEnd));
					responseDto.setTrialExpiredRemainingDays(Math.max(remainingDays, 0));
					responseDto.setTrialEndDate(DateTimeUtils.epochSecondToInstant(trialEnd));
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

		responseDto.setUsedTrials(getUsedTrials(tenant.getTenantName()));

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto getPricingPlans() throws StripeException {
		Map<SubscriptionPlan, Double> corePriceMap = new EnumMap<>(SubscriptionPlan.class);
		corePriceMap.put(SubscriptionPlan.MONTH, Price.retrieve(stripeCoreMonthlyPriceId).getUnitAmount() / 100.0);
		corePriceMap.put(SubscriptionPlan.YEAR, Price.retrieve(stripeCoreYearlyPriceId).getUnitAmount() / 100.0);

		Map<SubscriptionPlan, Double> proPriceMap = new EnumMap<>(SubscriptionPlan.class);
		proPriceMap.put(SubscriptionPlan.MONTH, Price.retrieve(stripeProMonthlyPriceId).getUnitAmount() / 100.0);
		proPriceMap.put(SubscriptionPlan.YEAR, Price.retrieve(stripeProYearlyPriceId).getUnitAmount() / 100.0);

		Map<Tier, Map<SubscriptionPlan, Double>> priceMap = new EnumMap<>(Tier.class);
		priceMap.put(Tier.CORE, corePriceMap);
		priceMap.put(Tier.PRO, proPriceMap);

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

		String priceId = getPriceId(subscriptionRequestDto.getTier(), subscriptionRequestDto.getSubscriptionPlan());

		Long employeeCount = employeeDao.countByAccountStatusIn(Set.of(AccountStatus.ACTIVE, AccountStatus.PENDING));

		SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
			.setQuantity(employeeCount)
			.setPrice(priceId)
			.build();

		builder.addLineItem(lineItem);

		SessionCreateParams.SubscriptionData.Builder subscriptionDataBuilder = SessionCreateParams.SubscriptionData
			.builder();

		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		boolean hadTrialForRequestedTier = stripeSubscriptionHistoryDao.existsByTenantNameAndSubscriptionStatusAndTier(
				tenantId, SubscriptionStatus.FREE_TRIAL, subscriptionRequestDto.getTier());
		tenantContext.setTenantAndSwitchSchema(tenantId);

		log.info(
				"createCheckoutSession: tenant={}, requestedTier={}, hadPreviousSubscription={}, hadTrialForRequestedTier={}",
				tenantId, subscriptionRequestDto.getTier(), hadPreviousSubscription, hadTrialForRequestedTier);

		if (!hadTrialForRequestedTier) {
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

	@Override
	public ResponseEntityDto upgradeTierSubscription(SubscriptionRequestDto subscriptionRequestDto)
			throws StripeException {
		if (subscriptionRequestDto.getTier() == null || subscriptionRequestDto.getTier() == Tier.FREE) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_REQUIRED_SUBSCRIPTION_PLAN);
		}

		if (subscriptionRequestDto.getSubscriptionPlan() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_REQUIRED_SUBSCRIPTION_PLAN);
		}

		String tenantId = TenantContext.getCurrentTenant();
		Tenant tenant = tenantService.getCurrentTenantFromSwitchingSchemas();

		if (tenant.getStripeSubscription() == null || tenant.getStripeSubscription().getSubscriptionId() == null
				|| tenant.getTier() == Tier.FREE || tenant.getSubscriptionStatus() == SubscriptionStatus.CANCELED) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TIER_UPGRADE_NO_ACTIVE_SUBSCRIPTION);
		}

		if (tenant.getTier() == subscriptionRequestDto.getTier()
				&& tenant.getSubscriptionPlan() == subscriptionRequestDto.getSubscriptionPlan()) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TIER_UPGRADE_ALREADY_ON_TIER);
		}

		if (tenant.getTier() != Tier.CORE || subscriptionRequestDto.getTier() != Tier.PRO) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_TIER_UPGRADE_NOT_AN_UPGRADE);
		}

		Tier requestedTier = subscriptionRequestDto.getTier();
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		boolean hadTrialForRequestedTier = stripeSubscriptionHistoryDao
			.existsByTenantNameAndSubscriptionStatusAndTier(tenantId, SubscriptionStatus.FREE_TRIAL, requestedTier);
		tenantContext.setTenantAndSwitchSchema(tenantId);

		log.info("upgradeTierSubscription: tenant={}, requestedTier={}, hadTrialForRequestedTier={}", tenantId,
				requestedTier, hadTrialForRequestedTier);

		String subscriptionId = tenant.getStripeSubscription().getSubscriptionId();
		Subscription subscription = Subscription.retrieve(subscriptionId);
		SubscriptionItem currentItem = subscription.getItems().getData().getFirst();
		String subscriptionItemId = currentItem.getId();
		long currentQuantity = currentItem.getQuantity();
		String newPriceId = getPriceId(requestedTier, subscriptionRequestDto.getSubscriptionPlan());

		SubscriptionUpdateParams.Builder paramsBuilder = SubscriptionUpdateParams.builder()
			.addItem(SubscriptionUpdateParams.Item.builder()
				.setId(subscriptionItemId)
				.setPrice(newPriceId)
				.setQuantity(currentQuantity)
				.build());

		if (hadTrialForRequestedTier) {
			paramsBuilder.setProrationBehavior(SubscriptionUpdateParams.ProrationBehavior.ALWAYS_INVOICE);
		}
		else {
			long trialEndEpoch = java.time.Instant.now()
				.plus(trialPeriodDays, java.time.temporal.ChronoUnit.DAYS)
				.getEpochSecond();
			paramsBuilder.setTrialEnd(trialEndEpoch);
			// Credit unused time from current plan; credit applied to first invoice
			// after trial
			paramsBuilder.setProrationBehavior(SubscriptionUpdateParams.ProrationBehavior.CREATE_PRORATIONS);
		}

		subscription.update(paramsBuilder.build());

		log.info(
				"upgradeTierSubscription: Successfully initiated tier upgrade for tenant={} to tier={} plan={} withTrial={}",
				tenantId, requestedTier, subscriptionRequestDto.getSubscriptionPlan(), !hadTrialForRequestedTier);

		return new ResponseEntityDto(false, "Tier upgrade initiated successfully");
	}

	private List<Tier> getUsedTrials(String tenantName) {
		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		List<Tier> usedTrials = stripeSubscriptionHistoryDao
			.findByTenantNameAndSubscriptionStatusAndTierIn(tenantName,
					SubscriptionStatus.FREE_TRIAL, List.of(Tier.CORE, Tier.PRO))
			.stream()
			.map(StripeSubscriptionHistory::getTier)
			.distinct()
			.toList();
		tenantContext.setTenantAndSwitchSchema(tenantName);
		return usedTrials;
	}

	private String getPriceId(Tier tier, SubscriptionPlan plan) {
		if (tier == Tier.PRO) {
			return plan == SubscriptionPlan.MONTH ? stripeProMonthlyPriceId : stripeProYearlyPriceId;
		}
		return plan == SubscriptionPlan.MONTH ? stripeCoreMonthlyPriceId : stripeCoreYearlyPriceId;
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
