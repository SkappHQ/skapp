package com.skapp.enterprise.invoice.payload.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerDocumentResponseDto {

	private Long id;

	private String name;

	private String documentUrl;

	private Long customerId;

	private String customerName;

	private String documentStatus;

}
