package com.skapp.enterprise.invoice.payload.response;

import com.skapp.enterprise.invoice.payload.request.customer.CustomerProjectDetailsDto;
import com.skapp.enterprise.invoice.type.CurrencyType;
import com.skapp.enterprise.invoice.type.CustomerStatus;
import com.skapp.enterprise.invoice.type.InvoiceDateFormat;
import com.skapp.enterprise.invoice.type.InvoiceNumberFormat;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CustomerDetailedResponseDto {

	private Long id;

	private String customerName;

	private String email;

	private String vatId;

	private String address;

	private String country;

	private CurrencyType currency;

	private InvoiceNumberFormat numberFormat;

	private InvoiceDateFormat dateFormat;

	private CustomerStatus status;

	private List<CustomerProjectDetailsDto> customerProjects;

	private List<CustomerContactResponseDto> customerContacts;

}
