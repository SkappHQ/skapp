package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.SystemVersionService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.type.SystemVersionTypes;
import com.skapp.community.common.type.VersionType;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.Validation;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.common.constant.EpAuthConstants;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.StripeSubscriptionDao;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.StripeSubscription;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.payload.request.BillingDetailsRequestDto;
import com.skapp.enterprise.common.payload.request.BillingDetailsResponseDto;
import com.skapp.enterprise.common.payload.request.CreateSubscriptionRequestDto;
import com.skapp.enterprise.common.payload.request.CreateSubscriptionResponseDto;
import com.skapp.enterprise.common.payload.request.PaymentMethodRequestDto;
import com.skapp.enterprise.common.payload.request.PromotionCodeRequestDto;
import com.skapp.enterprise.common.payload.request.SubscriptionDetailsResponseDto;
import com.skapp.enterprise.common.payload.request.SubscriptionRequestDto;
import com.skapp.enterprise.common.payload.request.UpdateSubscriptionRequestDto;
import com.skapp.enterprise.common.payload.response.SubscriptionResponseDto;
import com.skapp.enterprise.common.service.StripeService;
import com.skapp.enterprise.common.service.TenantService;
import com.skapp.enterprise.common.type.StripeWebhookEventTypes;
import com.skapp.enterprise.common.type.SubscriptionPlan;
import com.skapp.enterprise.common.type.SubscriptionStatus;
import com.skapp.enterprise.common.type.Tier;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.Invoice;
import com.stripe.model.PaymentMethod;
import com.stripe.model.PaymentMethodCollection;
import com.stripe.model.Price;
import com.stripe.model.PriceCollection;
import com.stripe.model.PromotionCode;
import com.stripe.model.PromotionCodeCollection;
import com.stripe.model.Subscription;
import com.stripe.net.Webhook;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.CustomerUpdateParams;
import com.stripe.param.InvoiceUpcomingParams;
import com.stripe.param.PaymentMethodAttachParams;
import com.stripe.param.PaymentMethodListParams;
import com.stripe.param.PriceListParams;
import com.stripe.param.SubscriptionUpdateParams;
import com.stripe.param.checkout.SessionCreateParams;
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
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class StripeServiceImpl implements StripeService {

	private final TenantContext tenantContext;

	private final TenantDao tenantDao;

	private final UserService userService;

	private final MessageUtil messageUtil;

	private final TenantService tenantService;

	private final StripeEmailService stripeEmailService;

	private final StripeSubscriptionDao stripeSubscriptionDao;

	private final SystemVersionService systemVersionService;

	@Value("${stripe.webhook-secret}")
	private String webhookSecret;

	@Value("${stripe.product.product-id}")
	private String stripeProductId;

	@Value("${stripe.trial.days}")
	private Long trialPeriodDays;

	@Override
	public void handleStripeEvent(String payload, String sigHeader) throws StripeException {
		log.info("Received Stripe webhook event");

		Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

		log.info("Processing Stripe event type: {}", event.getType());
		if (event.getType().equals(StripeWebhookEventTypes.INVOICE_PAYMENT_FAIL.getEventType())) {
			handleSubscriptionPaymentFail(event);
		}
		if (event.getType().equals(StripeWebhookEventTypes.CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END.getEventType())) {
			handleTrialEndSoon(event);
		}
		if (event.getType().equals(StripeWebhookEventTypes.INVOICE_PAYMENT_SUCCEEDED.getEventType())) {
			handleSubscriptionPaymentSucceeded(event);
		}
	}

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
                .setQuantity(subscriptionRequestDto.getSubscriptionQuantity())
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

    private void handleSubscriptionPaymentSucceeded(Event event) throws StripeException {

        log.info("handleSubscriptionPaymentSucceeded started");

        Invoice invoice = event.getDataObjectDeserializer()
                .getObject()
                .filter(Invoice.class::isInstance)
                .map(Invoice.class::cast)
                .orElse(null);

        if (invoice != null) {

            String customerId = invoice.getCustomer();
            String userEmail = invoice.getCustomerEmail();

            InvoiceUpcomingParams params = InvoiceUpcomingParams.builder()
                    .setSubscription(invoice.getSubscription())
                    .build();

            Invoice upcomingInvoice = Invoice.upcoming(params);

            String nextBillDate = DateTimeUtils.epochSecondToUtcLocalDate(upcomingInvoice.getCreated()).toString();
            tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
            StripeSubscription currentTenant = stripeSubscriptionDao.findByCustomerId(customerId);

            if (isTenantInvalid((currentTenant != null) ? currentTenant.getTenantName() : null)) {
                return;
            }
            if (currentTenant.getTenant().getSubscriptionStatus() == SubscriptionStatus.FREE_TRIAL
                    && invoice.getBillingReason().equals("subscription_cycle")) {

                stripeEmailService.sendCongratulationsOnUpgradingToSkappProMail(userEmail, nextBillDate,
                        currentTenant.getTenantName());

            }

        }

    }

    private void handleSubscriptionPaymentFail(Event event) {
        log.info("Handling subscription payment fail event");

        Invoice invoice = (Invoice) event.getDataObjectDeserializer()
                .getObject()
                .filter(Invoice.class::isInstance)
                .orElse(null);

        if (invoice != null) {

            String customerId = invoice.getCustomer();
            tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
            StripeSubscription currentTenant = stripeSubscriptionDao.findByCustomerId(customerId);
            if (isTenantInvalid((currentTenant != null) ? currentTenant.getTenantName() : null)) {
                return;
            }

            stripeEmailService.sendStripePaymentFailEmail(invoice, currentTenant.getTenantName());

        }
    }

    private void handleTrialEndSoon(Event event) {
        log.info("Handling trial end soon event");

        try {
            Subscription subscription = (Subscription) event.getDataObjectDeserializer()
                    .getObject()
                    .filter(Subscription.class::isInstance)
                    .orElse(null);

            if (subscription == null) {
                log.error("Subscription data not found in event");
                return;
            }

            String customerId = subscription.getCustomer();
            Customer customer = Customer.retrieve(customerId);
            String customerEmail = customer.getEmail();
            String trialEndDate = DateTimeUtils.epochSecondToUtcLocalDate(subscription.getTrialEnd()).toString();
            tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
            StripeSubscription currentTenant = stripeSubscriptionDao.findByCustomerId(customerId);
            if (isTenantInvalid((currentTenant != null) ? currentTenant.getTenantName() : null)) {
                return;
            }

            stripeEmailService.sendTrialEndSoonEmail(customerEmail, trialEndDate, currentTenant.getTenantName());
        }
        catch (StripeException | ModuleException e) {
            log.error("Error processing event {}: {}", StripeWebhookEventTypes.CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END,
                    e.getMessage(), e);
        }
    }

    private boolean isTenantInvalid(String tenantName) {
        if (tenantName == null || !tenantService.validateTenantExist(tenantName)) {
            log.info("Company domain not available");
            return true;
        }
        return false;
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
