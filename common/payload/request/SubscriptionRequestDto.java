package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.SubscriptionPlan;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubscriptionRequestDto {

	private SubscriptionPlan subscriptionPlan;

	private String successUrl;

	private String cancelUrl;

}
