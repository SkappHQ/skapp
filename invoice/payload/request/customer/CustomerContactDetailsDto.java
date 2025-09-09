package com.skapp.enterprise.invoice.payload.request.customer;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerContactDetailsDto {

	private Long customerId;

	private String contactName;

	private String email;

	private String contactNo;

	private String jobTitle;

}
