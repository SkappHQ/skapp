package com.skapp.enterprise.common.payload;

import com.skapp.enterprise.common.model.master.StripeSubscription;
import com.skapp.enterprise.common.model.master.Tenant;
import com.skapp.enterprise.common.type.SubscriptionStatus;
import com.skapp.enterprise.common.type.Tier;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;

@Getter
@AllArgsConstructor
public class SubscriptionValidationDto {

	private final Tier tier;

	private final SubscriptionStatus subscriptionStatus;

	private final Instant createdDate;

	private final StripeSubscription stripeSubscription;

	public boolean isProTier() {
		return tier == Tier.PRO;
	}

	public boolean isProTierActive() {
		return tier == Tier.PRO && SubscriptionStatus.ACTIVE.equals(subscriptionStatus);
	}

}
