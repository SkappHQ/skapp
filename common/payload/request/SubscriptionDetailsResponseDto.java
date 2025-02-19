package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.SubscriptionPlan;
import com.skapp.enterprise.common.type.Tier;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubscriptionDetailsResponseDto {

	private Tier tier;

	private String subscriptionId;

	private String customerId;

	private Long subscriptionQuantity;

	private SubscriptionPlan subscriptionPlan;

}
