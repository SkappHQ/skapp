package com.skapp.enterprise.common.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentMethodResponseDto {

	private String paymentMethodId;

	private String brand;

	private String last4;

	private Long expMonth;

	private Long expYear;

	private String funding;

	private Boolean isDefault;

}
