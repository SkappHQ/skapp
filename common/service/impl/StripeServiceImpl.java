package com.skapp.enterprise.common.service.impl;

import com.google.type.DateTime;
import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.repository.OrganizationDao;
import com.skapp.community.common.service.SystemVersionService;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.type.EmailBodyTemplates;
import com.skapp.community.common.util.DateTimeUtils;
import com.skapp.community.common.type.SystemVersionTypes;
import com.skapp.community.common.util.MessageUtil;
import com.skapp.community.common.util.Validation;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.StripeSubscriptionDao;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.StripeSubscription;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.payload.email.PaymentEmailStripeDynamicFields;
import com.skapp.enterprise.common.payload.request.BillingDetailsRequestDto;
import com.skapp.enterprise.common.payload.request.BillingDetailsResponseDto;
import com.skapp.enterprise.common.payload.request.CreateSubscriptionRequestDto;
import com.skapp.enterprise.common.payload.request.CreateSubscriptionResponseDto;
import com.skapp.enterprise.common.payload.request.PaymentMethodRequestDto;
import com.skapp.enterprise.common.payload.request.PromotionCodeRequestDto;
import com.skapp.enterprise.common.payload.request.SubscriptionDetailsResponseDto;
import com.skapp.enterprise.common.payload.response.PaymentMethodResponseDto;
import com.skapp.enterprise.common.payload.response.PromotionCodeResponseDto;
import com.skapp.enterprise.common.service.StripeEmailService;
import com.skapp.enterprise.common.service.StripeService;
import com.skapp.enterprise.common.service.TenantService;
import com.skapp.enterprise.common.type.StripeWebhookEventTypes;
import com.skapp.enterprise.common.type.SubscriptionPlan;
import com.skapp.enterprise.common.type.SubscriptionStatus;
import com.skapp.enterprise.common.type.Tier;
import com.skapp.enterprise.common.type.VersionType;
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
import com.stripe.param.PaymentMethodAttachParams;
import com.stripe.param.PaymentMethodListParams;
import com.stripe.param.PriceListParams;
import com.stripe.param.PromotionCodeListParams;
import com.stripe.param.SubscriptionCreateParams;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

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

	private final OrganizationDao organizationDao;

	private final SystemVersionService systemVersionService;

	@Value("${stripe.webhook-secret}")
	private String webhookSecret;

	@Value("${stripe.product.product-id}")
	private String stripeProductId;

	@Value("${stripe.trial.days}")
	private Long trialPeriodDays;

	@Override
	public void handleStripeEvent(String payload, String sigHeader) throws SignatureVerificationException {
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
	public ResponseEntityDto createSubscription(CreateSubscriptionRequestDto subscriptionRequestDto)
			throws StripeException {

		String currentTenant = TenantContext.getCurrentTenant();
		User currentUser = userService.getCurrentUser();

		tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		Tenant tenant = tenantDao.findByTenantName(currentTenant);

		validateSubscriptionRequest(tenant, subscriptionRequestDto);

		Customer customer = createStripeCustomer(subscriptionRequestDto);

		PaymentMethod paymentMethod = PaymentMethod.retrieve(subscriptionRequestDto.getPaymentMethodId());
		PaymentMethodAttachParams attachParams = PaymentMethodAttachParams.builder()
			.setCustomer(customer.getId())
			.build();
		paymentMethod.attach(attachParams);

		CustomerUpdateParams.InvoiceSettings invoiceSettings = CustomerUpdateParams.InvoiceSettings.builder()
			.setDefaultPaymentMethod(paymentMethod.getId())
			.build();

		CustomerUpdateParams customerUpdateParams = CustomerUpdateParams.builder()
			.setInvoiceSettings(invoiceSettings)
			.build();
		customer.update(customerUpdateParams);

		Subscription subscription = createStripeSubscription(customer, subscriptionRequestDto);
		Tenant tenantDetails = saveSubscription(tenant, currentUser, subscription, subscriptionRequestDto);

		tenantContext.setTenantAndSwitchSchema(currentTenant);
		CreateSubscriptionResponseDto responseDto = new CreateSubscriptionResponseDto();
		responseDto.setCustomerId(tenantDetails.getStripeSubscription().getCustomerId());
		responseDto.setSubscriptionId(tenantDetails.getStripeSubscription().getSubscriptionId());

		String customerId = subscription.getCustomer();
		Customer customerDetails = Customer.retrieve(customerId);
		String customerEmail = customerDetails.getEmail();
		String trialEndDate = DateTimeUtils.epochSecondToUtcLocalDate(subscription.getTrialEnd()).toString();

		processTenantSchema(currentTenant,
				() -> stripeEmailService.sendWelcomeToSkappProFreeTrialEmail(customerEmail, trialEndDate));

		systemVersionService.upgradeSystemVersion(VersionType.MAJOR, SystemVersionTypes.TIER_CHANGE_FROM_FREE_TO_PRO);

		return new ResponseEntityDto(false, responseDto);
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

		responseDto.setTotalCost(subscription.getItems()
			.getData()
			.stream()
			.mapToDouble(item -> (item.getPrice().getUnitAmount() / 100.0)
					* (item.getQuantity() != null ? item.getQuantity() : 1))
			.sum());

		responseDto.setNextBillingDate(subscription.getCurrentPeriodEnd() != null
				? Instant.ofEpochSecond(subscription.getCurrentPeriodEnd()) : null);

		if (subscription.getTrialEnd() != null) {
			long remainingDays = ChronoUnit.DAYS.between(LocalDate.now(),
					Instant.ofEpochSecond(subscription.getTrialEnd()).atOffset(ZoneOffset.UTC).toLocalDate());
			responseDto.setTrialExpiredRemainingDays(Math.max(remainingDays, 0));
			responseDto.setTrialEndDate(Instant.ofEpochSecond(subscription.getTrialEnd()));
		}

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto getPricingPlans() throws StripeException {
		Map<SubscriptionPlan, Double> priceMap = getPriceValueMap();
		return new ResponseEntityDto(false, priceMap);

	}

	@Override
	public ResponseEntityDto getBillingDetails() throws StripeException {
		Customer customer = getStripeCustomer();
		BillingDetailsResponseDto billingDetails = getBillingDetailsResponseDto(customer);

		return new ResponseEntityDto(false, billingDetails);
	}

	@Override
	public ResponseEntityDto updateBillingDetails(BillingDetailsRequestDto billingDetailsRequestDto)
			throws StripeException {
		Customer customer = getStripeCustomer();

		CustomerUpdateParams updateParams = CustomerUpdateParams.builder()
			.setEmail(billingDetailsRequestDto.getBillingEmail())
			.setName(billingDetailsRequestDto.getBillingName())
			.setAddress(CustomerUpdateParams.Address.builder()
				.setLine1(billingDetailsRequestDto.getBillingAddressLineOne())
				.setLine2(billingDetailsRequestDto.getBillingAddressLineTwo())
				.setCity(billingDetailsRequestDto.getBillingCity())
				.setState(billingDetailsRequestDto.getBillingState())
				.setCountry(billingDetailsRequestDto.getBillingCountry())
				.setPostalCode(billingDetailsRequestDto.getBillingPostalCode())
				.build())
			.build();

		Customer updatedCustomer = customer.update(updateParams);

		BillingDetailsResponseDto billingDetails = getBillingDetailsResponseDto(updatedCustomer);
		return new ResponseEntityDto(false, billingDetails);
	}

	@Override
	public ResponseEntityDto verifyPromotionCode(PromotionCodeRequestDto promotionCodeRequestDto)
			throws StripeException {
		Tenant tenant = tenantService.getCurrentTenantFromSwitchingSchemas();

		if (tenant.getStripeSubscription() == null || tenant.getStripeSubscription().getSubscriptionId() == null) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_NOT_FOUND);
		}

		PromotionCodeListParams params = PromotionCodeListParams.builder().setActive(true).build();

		PromotionCodeCollection promotionCodes = PromotionCode.list(params);

		PromotionCode matchingCode = promotionCodes.getData()
			.stream()
			.filter(code -> code.getCode().equalsIgnoreCase(promotionCodeRequestDto.getPromotionCode()))
			.findFirst()
			.orElse(null);

		if (matchingCode == null) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_PROMO_CODE);
		}

		PromotionCode stripePromotionCode = PromotionCode.retrieve(matchingCode.getId());

		if (Boolean.FALSE.equals(stripePromotionCode.getActive())) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_INACTIVE_PROMO_CODE);
		}

		PromotionCodeResponseDto promoCodeResponse = new PromotionCodeResponseDto();
		promoCodeResponse.setPromotionCodeId(stripePromotionCode.getId());
		promoCodeResponse.setIsValid(stripePromotionCode.getActive());
		promoCodeResponse.setDiscountAmountOff(stripePromotionCode.getCoupon().getAmountOff());
		promoCodeResponse.setDiscountPercentageOff(stripePromotionCode.getCoupon().getPercentOff());

		return new ResponseEntityDto(false, promoCodeResponse);
	}

	@Override
	public ResponseEntityDto getPaymentMethods() throws StripeException {
		Customer customer = getStripeCustomer();
		PaymentMethodListParams params = PaymentMethodListParams.builder()
			.setCustomer(customer.getId())
			.setType(PaymentMethodListParams.Type.CARD)
			.build();

		PaymentMethodCollection paymentMethods = PaymentMethod.list(params);

		List<PaymentMethodResponseDto> paymentMethodDtos = paymentMethods.getData()
			.stream()
			.map(paymentMethod -> mapToPaymentMethodDto(paymentMethod, customer))
			.toList();

		return new ResponseEntityDto(false, paymentMethodDtos);
	}

	@Override
	public ResponseEntityDto attachPaymentMethodToCustomer(PaymentMethodRequestDto paymentMethodRequestDto)
			throws StripeException {
		Customer customer = getStripeCustomer();

		PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodRequestDto.getPaymentMethodId());
		PaymentMethodAttachParams attachParams = PaymentMethodAttachParams.builder()
			.setCustomer(customer.getId())
			.build();
		paymentMethod.attach(attachParams);

		PaymentMethodResponseDto responseDto = mapToPaymentMethodDto(paymentMethod, customer);

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto setDefaultPaymentMethod(PaymentMethodRequestDto paymentMethodRequestDto)
			throws StripeException {
		Customer customer = getStripeCustomer();
		validatePaymentMethodId(paymentMethodRequestDto.getPaymentMethodId(), customer);

		CustomerUpdateParams.InvoiceSettings invoiceSettings = CustomerUpdateParams.InvoiceSettings.builder()
			.setDefaultPaymentMethod(paymentMethodRequestDto.getPaymentMethodId())
			.build();

		CustomerUpdateParams customerUpdateParams = CustomerUpdateParams.builder()
			.setInvoiceSettings(invoiceSettings)
			.build();

		Customer updatedCustomer = customer.update(customerUpdateParams);

		PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodRequestDto.getPaymentMethodId());
		PaymentMethodResponseDto paymentMethodResponseDto = mapToPaymentMethodDto(paymentMethod, updatedCustomer);

		return new ResponseEntityDto(false, paymentMethodResponseDto);
	}

	@Override
	public ResponseEntityDto removePaymentMethod(PaymentMethodRequestDto paymentMethodRequestDto)
			throws StripeException {
		Customer customer = getStripeCustomer();
		validatePaymentMethodId(paymentMethodRequestDto.getPaymentMethodId(), customer);

		PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodRequestDto.getPaymentMethodId());

		if (isDefaultPaymentMethod(paymentMethod, customer)) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_DEFAULT_PAYMENT_METHOD);
		}

		paymentMethod.detach();

		return new ResponseEntityDto(false,
				messageUtil.getMessage(EPCommonMessageConstant.EP_COMMON_SUCCESS_PAYMENT_METHOD_REMOVED));
	}

	private BillingDetailsResponseDto getBillingDetailsResponseDto(Customer customer) {
		BillingDetailsResponseDto billingDetails = new BillingDetailsResponseDto();
		billingDetails.setCustomerId(customer.getId());
		billingDetails.setBillingEmail(customer.getEmail());
		billingDetails.setBillingName(customer.getName());
		billingDetails.setBillingAddressLineOne(customer.getAddress().getLine1());
		billingDetails.setBillingAddressLineTwo(customer.getAddress().getLine2());
		billingDetails.setBillingCity(customer.getAddress().getCity());
		billingDetails.setBillingState(customer.getAddress().getState());
		billingDetails.setBillingCountry(customer.getAddress().getCountry());
		billingDetails.setBillingPostalCode(customer.getAddress().getPostalCode());
		return billingDetails;
	}

	private void validateSubscriptionRequest(Tenant tenant, CreateSubscriptionRequestDto subscriptionRequestDto) {
		if (tenant.getStripeSubscription() != null && tenant.getStripeSubscription().getSubscriptionId() != null
				&& tenant.getTier() != Tier.FREE) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_ALREADY_EXISTS);
		}

		if (subscriptionRequestDto.getSubscriptionPlan() == null
				|| subscriptionRequestDto.getSubscriptionPlan().describeConstable().isEmpty()) {
			throw new ValidationException(EPCommonMessageConstant.STRIPE_ERROR_INVALID_SUBSCRIPTION_PLAN);
		}

		if (subscriptionRequestDto.getSubscriptionQuantity() == null
				|| subscriptionRequestDto.getSubscriptionQuantity() <= 0) {
			throw new ValidationException(EPCommonMessageConstant.STRIPE_ERROR_INVALID_SUBSCRIPTION_QUANTITY);
		}

		if (subscriptionRequestDto.getBillingEmail() == null || subscriptionRequestDto.getBillingEmail().isEmpty()) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_BILLING_EMAIL_EMPTY);
		}

		if (!Validation.isValidEmail(subscriptionRequestDto.getBillingEmail())) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_EMAIL_FORMAT);
		}
	}

	private Tenant saveSubscription(Tenant tenant, User currentUser, Subscription subscription,
			CreateSubscriptionRequestDto subscriptionRequestDto) {
		tenant.setBillingEmail(subscriptionRequestDto.getBillingEmail());
		tenant.setSubscriptionPlan(subscriptionRequestDto.getSubscriptionPlan());
		tenant.setTier(Tier.PRO);
		tenant.setLastModifiedByEmail(currentUser.getEmail());
		tenant.setLastModifiedDate(Instant.now());
		tenant.setSubscriptionQuantity(subscriptionRequestDto.getSubscriptionQuantity());
		tenant.setSubscriptionStatus(SubscriptionStatus.FREE_TRIAL);

		StripeSubscription stripeSubscription = new StripeSubscription();
		stripeSubscription.setTenantName(tenant.getTenantName());
		stripeSubscription.setSubscriptionStartDate(Instant.ofEpochSecond(subscription.getStartDate()));
		stripeSubscription.setCreatedByEmail(currentUser.getEmail());
		stripeSubscription.setCreatedDate(Instant.now());
		stripeSubscription.setSubscriptionId(subscription.getId());
		stripeSubscription.setCustomerId(subscription.getCustomer());

		stripeSubscription.setTenant(tenant);

		tenant.setStripeSubscription(stripeSubscription);

		return tenantDao.save(tenant);
	}

	private Customer createStripeCustomer(CreateSubscriptionRequestDto subscriptionRequestDto) throws StripeException {
		CustomerCreateParams.Address address = CustomerCreateParams.Address.builder()
			.setCity(subscriptionRequestDto.getBillingCity())
			.setCountry(subscriptionRequestDto.getBillingCountry())
			.setLine1(subscriptionRequestDto.getBillingAddressLineOne())
			.setLine2(subscriptionRequestDto.getBillingAddressLineTwo())
			.setPostalCode(subscriptionRequestDto.getBillingPostalCode())
			.setState(subscriptionRequestDto.getBillingState())
			.build();

		CustomerCreateParams customerParams = CustomerCreateParams.builder()
			.setEmail(subscriptionRequestDto.getBillingEmail())
			.setName(subscriptionRequestDto.getBillingName())
			.setAddress(address)
			.build();

		return Customer.create(customerParams);
	}

	private Subscription createStripeSubscription(Customer customer,
			CreateSubscriptionRequestDto subscriptionRequestDto) throws StripeException {
		Map<SubscriptionPlan, String> priceMap = getPriceMap();
		SubscriptionCreateParams.Item item = SubscriptionCreateParams.Item.builder()
			.setPrice(subscriptionRequestDto.getSubscriptionPlan() == SubscriptionPlan.MONTH
					? priceMap.get(SubscriptionPlan.MONTH) : priceMap.get(SubscriptionPlan.YEAR))
			.setQuantity(subscriptionRequestDto.getSubscriptionQuantity())
			.build();

		SubscriptionCreateParams.PaymentSettings paymentSettings = SubscriptionCreateParams.PaymentSettings.builder()
			.setSaveDefaultPaymentMethod(
					SubscriptionCreateParams.PaymentSettings.SaveDefaultPaymentMethod.ON_SUBSCRIPTION)
			.build();

		SubscriptionCreateParams subParams = SubscriptionCreateParams.builder()
			.setCustomer(customer.getId())
			.addItem(item)
			.setPaymentSettings(paymentSettings)
			.setPromotionCode(subscriptionRequestDto.getPromotionCodeId())
			.setTrialPeriodDays(trialPeriodDays)
			.build();

		return Subscription.create(subParams);
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

	private PaymentMethodResponseDto mapToPaymentMethodDto(PaymentMethod paymentMethod, Customer customer) {
		PaymentMethodResponseDto paymentMethodResponseDto = new PaymentMethodResponseDto();
		paymentMethodResponseDto.setPaymentMethodId(paymentMethod.getId());

		PaymentMethod.Card card = paymentMethod.getCard();
		if (card != null) {
			paymentMethodResponseDto.setBrand(card.getBrand());
			paymentMethodResponseDto.setLast4(card.getLast4());
			paymentMethodResponseDto.setExpMonth(card.getExpMonth());
			paymentMethodResponseDto.setExpYear(card.getExpYear());
			paymentMethodResponseDto.setFunding(card.getFunding());
		}

		paymentMethodResponseDto.setIsDefault(isDefaultPaymentMethod(paymentMethod, customer));

		return paymentMethodResponseDto;
	}

	private boolean isDefaultPaymentMethod(PaymentMethod paymentMethod, Customer customer) {
		String defaultPaymentMethodId = customer.getInvoiceSettings() != null
				? customer.getInvoiceSettings().getDefaultPaymentMethod() : null;

		return defaultPaymentMethodId != null && paymentMethod.getId().equals(defaultPaymentMethodId);
	}

	private String getStripeCustomerId() {
		Tenant tenant = tenantService.getCurrentTenantFromSwitchingSchemas();
		if (tenant.getStripeSubscription() == null || tenant.getStripeSubscription().getCustomerId() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_NOT_FOUND);
		}
		return tenant.getStripeSubscription().getCustomerId();
	}

	private Customer getStripeCustomer() throws StripeException {
		return Customer.retrieve(getStripeCustomerId());
	}

	private void validatePaymentMethodId(String paymentMethodId, Customer customer) throws StripeException {
		if (paymentMethodId == null || paymentMethodId.isBlank()) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_PAYMENT_METHOD);
		}

		PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodId);

		if (!customer.getId().equals(paymentMethod.getCustomer())) {
			throw new ValidationException(
					EPCommonMessageConstant.EP_COMMON_ERROR_PAYMENT_METHOD_NOT_BELONG_TO_CUSTOMER);
		}
	}

	private void handleSubscriptionPaymentSucceeded(Event event) {

		log.info("handleSubscriptionPaymentSucceeded started");

		Invoice invoice = (Invoice) event.getDataObjectDeserializer()
			.getObject()
			.filter(obj -> obj instanceof Invoice)
			.orElse(null);

		if (invoice != null) {

			String customerId = invoice.getCustomer();
			String userEmail = invoice.getCustomerEmail();

			StripeSubscription currentTenant = stripeSubscriptionDao.findByCustomerId(customerId);
			if (isTenantInvalid((currentTenant != null) ? currentTenant.getTenantName() : null)) {
				return;
			}
			if (currentTenant.getTenant().getSubscriptionStatus() == SubscriptionStatus.FREE_TRIAL
					&& invoice.getBillingReason().equals("subscription_cycle")) {
				processTenantSchema(currentTenant.getTenantName(), () ->

				stripeEmailService.SendCongratulationsOnUpgradingToSkappProMail(userEmail,
						DateTimeUtils.getCurrentUtcDate().toString())

				);

			}

		}

	}

	private void handleSubscriptionPaymentFail(Event event) {
		log.info("Handling subscription payment fail event");

		Invoice invoice = (Invoice) event.getDataObjectDeserializer()
			.getObject()
			.filter(obj -> obj instanceof Invoice)
			.orElse(null);

		if (invoice != null) {

			String customerId = invoice.getCustomer();

			StripeSubscription currentTenant = stripeSubscriptionDao.findByCustomerId(customerId);
			if (isTenantInvalid((currentTenant != null) ? currentTenant.getTenantName() : null)) {
				return;
			}
			processTenantSchema(currentTenant.getTenantName(), () -> {
				int attemptCount = invoice.getAttemptCount().intValue();
				if (attemptCount == 1) {
					stripeEmailService.sendStripePaymentFailEmailCountOne(invoice);
				}
				else if (attemptCount == 2) {
					stripeEmailService.sendStripePaymentFailEmailCountTwo(invoice);
				}
				else if (attemptCount == 3) {
					stripeEmailService.sendStripePaymentFailEmailCountThree(invoice);
				}
				else if (attemptCount == 4) {
					stripeEmailService.sendStripePaymentFailEmailCountFour(invoice);
				}
			});

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
			StripeSubscription currentTenant = stripeSubscriptionDao.findByCustomerId(customerId);
			if (isTenantInvalid((currentTenant != null) ? currentTenant.getTenantName() : null)) {
				return;
			}
			processTenantSchema(currentTenant.getTenantName(),
					() -> stripeEmailService.sendTrialEndSoonEmail(customerEmail, trialEndDate));
		}
		catch (StripeException | ModuleException e) {
			log.error("Error processing event {}: {}", StripeWebhookEventTypes.CUSTOMER_SUBSCRIPTION_TRIAL_WILL_END,
					e.getMessage(), e);
		}
	}

	private void processTenantSchema(String tenantName, Runnable action) {
		tenantContext.setTenantAndSwitchSchema(tenantName);
		try {
			action.run();
		}
		finally {
			tenantContext.setTenantAndSwitchSchema(EpCommonConstants.MASTER_DATABASE);
		}

	}

	private boolean isTenantInvalid(String tenantName) {
		if (tenantName == null || !tenantService.validateTenantExist(tenantName)) {
			log.info("Company domain not available");
			return true;
		}
		return false;
	}

}
