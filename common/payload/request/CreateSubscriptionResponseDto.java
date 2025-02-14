package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.SubscriptionPlan;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateSubscriptionResponseDto {

	private String subscriptionId;

	private String customerId;

	private String billingEmail;

	private int subscriptionQuantity;

	private SubscriptionPlan subscriptionPlan;

}
