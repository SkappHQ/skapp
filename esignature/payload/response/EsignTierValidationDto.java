package com.skapp.enterprise.esignature.payload.response;

import com.skapp.enterprise.common.model.master.StripeSubscription;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.type.SubscriptionStatus;
import com.skapp.enterprise.common.type.Tier;
import lombok.Getter;

import java.time.Instant;

@Getter
public class EsignTierValidationDto {

	private final Tier tier;

	private final SubscriptionStatus subscriptionStatus;

	private final Instant createdDate;

	private final StripeSubscription stripeSubscription;

	public EsignTierValidationDto(Tenant tenant) {
		this.tier = tenant.getTier();
		this.subscriptionStatus = tenant.getSubscriptionStatus();
		this.createdDate = tenant.getCreatedDate();
		this.stripeSubscription = tenant.getStripeSubscription();
	}

	public boolean isProTier() {
		return tier == Tier.PRO;
	}

	public boolean isProTierActive() {
		return tier == Tier.PRO && SubscriptionStatus.ACTIVE.equals(subscriptionStatus);
	}

}
