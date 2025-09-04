package com.skapp.enterprise.invoice.payload.request.customer;

import com.skapp.enterprise.invoice.type.CurrencyType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerBillingDetailsDto {

	private String email;

	private String address;

	private String country;

	private CurrencyType currency;

}
