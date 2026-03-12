package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.SubscriptionPlan;
import com.skapp.enterprise.common.type.SubscriptionStatus;
import com.skapp.enterprise.common.type.Tier;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class SubscriptionDetailsResponseDto {

	private Tier tier;

	private String subscriptionId;

	private String customerId;

	private Long subscriptionQuantity;

	private SubscriptionPlan subscriptionPlan;

	private double totalCost;

	private Instant nextBillingDate;

	private Long trialExpiredRemainingDays;

	private Instant trialEndDate;

	private SubscriptionStatus subscriptionStatus;

	private Instant cancellationDate;

	private List<Tier> usedTrials;

}
