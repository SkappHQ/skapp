package com.skapp.enterprise.common.service.impl;

import com.skapp.community.common.exception.ModuleException;
import com.skapp.community.common.exception.ValidationException;
import com.skapp.community.common.model.User;
import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.community.common.service.UserService;
import com.skapp.community.common.util.Validation;
import com.skapp.enterprise.common.config.TenantContext;
import com.skapp.enterprise.common.constant.EPCommonMessageConstant;
import com.skapp.enterprise.common.constant.EpCommonConstants;
import com.skapp.enterprise.common.masterrepository.TenantDao;
import com.skapp.enterprise.common.model.master.StripeSubscription;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.payload.request.BillingDetailsRequestDto;
import com.skapp.enterprise.common.payload.request.BillingDetailsResponseDto;
import com.skapp.enterprise.common.payload.request.CreateSubscriptionRequestDto;
import com.skapp.enterprise.common.payload.request.CreateSubscriptionResponseDto;
import com.skapp.enterprise.common.payload.request.SubscriptionDetailsResponseDto;
import com.skapp.enterprise.common.payload.response.PromotionCodeResponseDto;
import com.skapp.enterprise.common.service.StripeService;
import com.skapp.enterprise.common.type.SubscriptionPlan;
import com.skapp.enterprise.common.type.SubscriptionStatus;
import com.skapp.enterprise.common.type.Tier;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.PaymentMethod;
import com.stripe.model.Price;
import com.stripe.model.PriceCollection;
import com.stripe.model.PromotionCode;
import com.stripe.model.PromotionCodeCollection;
import com.stripe.model.Subscription;
import com.stripe.net.Webhook;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.CustomerUpdateParams;
import com.stripe.param.PaymentMethodAttachParams;
import com.stripe.param.PriceListParams;
import com.stripe.param.PromotionCodeListParams;
import com.stripe.param.SubscriptionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class StripeServiceImpl implements StripeService {

	private final TenantContext tenantContext;

	private final TenantDao tenantDao;

	private final UserService userService;

	@Value("${stripe.webhook-secret}")
	private String webhookSecret;

	@Value("${stripe.product.product-id}")
	private String stripeProductId;

	@Override
	public void handleStripeEvent(String payload, String sigHeader) throws SignatureVerificationException {
		log.info("Received Stripe webhook event");

		Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

		log.info("Processing Stripe event type: {}", event.getType());
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

		CreateSubscriptionResponseDto responseDto = new CreateSubscriptionResponseDto();
		responseDto.setCustomerId(tenantDetails.getStripeSubscription().getCustomerId());
		responseDto.setSubscriptionId(tenantDetails.getStripeSubscription().getSubscriptionId());

		return new ResponseEntityDto(false, responseDto);
	}

	@Override
	public ResponseEntityDto getSubscriptionDetails() {
		SubscriptionDetailsResponseDto responseDto = new SubscriptionDetailsResponseDto();

		Tenant tenant = tenantContext.getCurrentTenantFromSwitchingSchemas();

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

	@Override
	public ResponseEntityDto getPricingPlans() throws StripeException {
		return new ResponseEntityDto(false, getPriceMap());
	}

	@Override
	public ResponseEntityDto getBillingDetails() throws StripeException {
		Tenant tenant = tenantContext.getCurrentTenantFromSwitchingSchemas();

		if (tenant.getStripeSubscription() == null || tenant.getStripeSubscription().getCustomerId() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_NOT_FOUND);
		}

		Customer customer = Customer.retrieve(tenant.getStripeSubscription().getCustomerId());
		BillingDetailsResponseDto billingDetails = getBillingDetailsResponseDto(customer);

		return new ResponseEntityDto(false, billingDetails);
	}

	@Override
	public ResponseEntityDto updateBillingDetails(BillingDetailsRequestDto billingDetailsRequestDto)
			throws StripeException {
		Tenant tenant = tenantContext.getCurrentTenantFromSwitchingSchemas();

		if (tenant.getStripeSubscription() == null || tenant.getStripeSubscription().getCustomerId() == null) {
			throw new ModuleException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_NOT_FOUND);
		}

		Customer customer = Customer.retrieve(tenant.getStripeSubscription().getCustomerId());

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
	public ResponseEntityDto verifyPromotionCode(String promotionCode) throws StripeException {
		Tenant tenant = tenantContext.getCurrentTenantFromSwitchingSchemas();

		if (tenant.getStripeSubscription() == null || tenant.getStripeSubscription().getSubscriptionId() == null) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_SUBSCRIPTION_NOT_FOUND);
		}

		PromotionCodeListParams params = PromotionCodeListParams.builder().setActive(true).build();

		PromotionCodeCollection promotionCodes = PromotionCode.list(params);

		PromotionCode matchingCode = promotionCodes.getData()
			.stream()
			.filter(code -> code.getCode().equalsIgnoreCase(promotionCode))
			.findFirst()
			.orElse(null);

		if (matchingCode == null) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_INVALID_PROMO_CODE);
		}

		PromotionCode stripePromotionCode = PromotionCode.retrieve(matchingCode.getId());

		if (!stripePromotionCode.getActive()) {
			throw new ValidationException(EPCommonMessageConstant.EP_COMMON_ERROR_INACTIVE_PROMO_CODE);
		}

		PromotionCodeResponseDto promoCodeResponse = new PromotionCodeResponseDto();
		promoCodeResponse.setPromotionCodeId(stripePromotionCode.getId());
		promoCodeResponse.setIsValid(stripePromotionCode.getActive());
		promoCodeResponse.setDiscountAmountOff(stripePromotionCode.getCoupon().getAmountOff());
		promoCodeResponse.setDiscountPercentageOff(stripePromotionCode.getCoupon().getPercentOff());

		return new ResponseEntityDto(false, promoCodeResponse);
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
		stripeSubscription.setSubscriptionStartDate(Instant.now());
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
			.build();

		return Subscription.create(subParams);
	}

	private Map<SubscriptionPlan, String> getPriceMap() throws StripeException {
		PriceListParams params = PriceListParams.builder().setProduct(stripeProductId).setActive(true).build();
		PriceCollection prices = Price.list(params);
		Map<SubscriptionPlan, String> priceMap = new HashMap<>();
		for (Price price : prices.getData()) {
			if (price.getRecurring() != null) {
				SubscriptionPlan plan = SubscriptionPlan.valueOf(price.getRecurring().getInterval().toUpperCase());
				priceMap.put(plan, price.getId());
			}
		}
		return priceMap;
	}

}
