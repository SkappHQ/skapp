package com.skapp.enterprise.invoice.payload.request;

import com.skapp.enterprise.invoice.payload.request.customer.CustomerBillingDetailsDto;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CustomerCreateRequestDto {

	private String customerName;

	private List<Long> projectIds;

	private CustomerBillingDetailsDto customerBillingDetails;

}
