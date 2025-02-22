package com.skapp.enterprise.common.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BillingDetailsResponseDto {

	private String customerId;

	private String billingName;

	private String billingCity;

	private String billingCountry;

	private String billingAddressLineOne;

	private String billingAddressLineTwo;

	private String billingPostalCode;

	private String billingState;

	private String billingEmail;

}
