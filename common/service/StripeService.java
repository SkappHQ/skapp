package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.BillingDetailsRequestDto;
import com.skapp.enterprise.common.payload.request.CreateSubscriptionRequestDto;
import com.skapp.enterprise.common.payload.request.PaymentMethodRequestDto;
import com.skapp.enterprise.common.payload.request.PromotionCodeRequestDto;
import com.skapp.enterprise.common.payload.request.UpdateSubscriptionRequestDto;
import com.skapp.enterprise.common.payload.request.SubscriptionRequestDto;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;

public interface StripeService {

	void handleStripeEvent(String payload, String sigHeader) throws SignatureVerificationException;

	ResponseEntityDto createSubscription(CreateSubscriptionRequestDto subscriptionRequestDto) throws StripeException;

	ResponseEntityDto getSubscriptionDetails() throws StripeException;

	ResponseEntityDto getPricingPlans() throws StripeException;

	ResponseEntityDto getBillingDetails() throws StripeException;

	ResponseEntityDto updateBillingDetails(BillingDetailsRequestDto billingDetailsRequestDto) throws StripeException;

	ResponseEntityDto verifyPromotionCode(PromotionCodeRequestDto promotionCodeRequestDto) throws StripeException;

	ResponseEntityDto getPaymentMethods() throws StripeException;

	ResponseEntityDto attachPaymentMethodToCustomer(PaymentMethodRequestDto paymentMethodRequestDto)
			throws StripeException;

	ResponseEntityDto setDefaultPaymentMethod(PaymentMethodRequestDto paymentMethodRequestDto) throws StripeException;

	ResponseEntityDto removePaymentMethod(PaymentMethodRequestDto paymentMethodRequestDto) throws StripeException;

	ResponseEntityDto cancelSubscription() throws StripeException;

	ResponseEntityDto updateSubscription(UpdateSubscriptionRequestDto updateSubscriptionRequestDto)
			throws StripeException;

    ResponseEntityDto createCheckoutSession(SubscriptionRequestDto subscriptionRequestDto) throws StripeException;

}
