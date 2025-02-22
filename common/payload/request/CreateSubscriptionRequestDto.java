package com.skapp.enterprise.common.payload.request;

import com.skapp.enterprise.common.type.SubscriptionPlan;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateSubscriptionRequestDto {

	private String billingName;

	private String billingCity;

	private String billingCountry;

	private String billingAddressLineOne;

	private String billingAddressLineTwo;

	private String billingPostalCode;

	private String billingState;

	private String billingEmail;

	private String paymentMethodId;

	private Long subscriptionQuantity;

	private SubscriptionPlan subscriptionPlan;

	private String promoCodeId;

}
