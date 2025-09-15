package com.skapp.enterprise.invoice.payload.response;

import com.skapp.enterprise.invoice.payload.request.customer.CustomerProjectDetailsDto;
import com.skapp.enterprise.invoice.type.CurrencyType;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CustomerDetailedResponseDto {

	private Long id;

	private String customerName;

	private String email;

	private String address;

	private String country;

	private CurrencyType currency;

	private List<CustomerProjectDetailsDto> customerProjects;

	private List<CustomerContactResponseDto> customerContacts;

}
