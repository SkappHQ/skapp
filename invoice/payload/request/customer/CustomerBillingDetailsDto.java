package com.skapp.enterprise.invoice.payload.request.customer;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.skapp.enterprise.invoice.type.CurrencyType;
import com.skapp.enterprise.invoice.util.deserializer.CurrencyTypeDeserializer;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerBillingDetailsDto {

	private String email;

	private String address;

	private String country;

	@JsonDeserialize(using = CurrencyTypeDeserializer.class)
	private CurrencyType currency;

}
