package com.skapp.enterprise.common.service;

import com.skapp.community.common.payload.response.ResponseEntityDto;
import com.skapp.enterprise.common.payload.request.SubscriptionRequestDto;
import com.skapp.enterprise.common.type.SubscriptionPlan;
import com.skapp.enterprise.common.type.Tier;
import com.stripe.exception.StripeException;

public interface StripeService {

	ResponseEntityDto getSubscriptionDetails() throws StripeException;

	ResponseEntityDto getPricingPlans() throws StripeException;

	ResponseEntityDto getPricingPlansForTier(Tier tier) throws StripeException;

	ResponseEntityDto createCheckoutSession(SubscriptionRequestDto subscriptionRequestDto) throws StripeException;

	ResponseEntityDto createCustomerPortalSession() throws StripeException;

	SubscriptionPlan getSubscriptionPlanFromPriceId(String priceId) throws StripeException;

	void updateSubscriptionQuantity(Long quantity, boolean isIncrement, boolean isFromEmployeeBulk);

	ResponseEntityDto activateTenantAfterFreeTrial();

}
