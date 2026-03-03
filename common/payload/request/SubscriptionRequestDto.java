package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.SubscriptionPlan;
import com.skapp.enterprise.common.type.Tier;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubscriptionRequestDto {

	private SubscriptionPlan subscriptionPlan;

	private Tier tier;

	private String successUrl;

	private String cancelUrl;

}
