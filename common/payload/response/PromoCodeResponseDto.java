package com.skapp.enterprise.common.payload.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PromoCodeResponseDto {

	private String promoCode;

	private Boolean isValid;

	private BigDecimal discountPercentageOff;

	private Long discountAmountOff;

}
