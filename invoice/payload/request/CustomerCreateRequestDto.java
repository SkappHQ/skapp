package com.skapp.enterprise.invoice.payload.request;

import com.skapp.enterprise.invoice.payload.request.customer.CustomerBillingDetailsDto;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CustomerCreateRequestDto {

	@NotBlank(message = "{validation.envelope.name.not_blank}")
	private String customerName;

	private List<Long> projectIds;

	private CustomerBillingDetailsDto billingDetails;

}
