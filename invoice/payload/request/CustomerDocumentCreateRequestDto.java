package com.skapp.enterprise.invoice.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerDocumentCreateRequestDto {

	private String name;

	private String documentUrl;

	private Long customerId;

}
