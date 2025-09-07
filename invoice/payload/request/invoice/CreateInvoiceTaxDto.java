package com.skapp.enterprise.invoice.payload.request.invoice;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateInvoiceTaxDto {

	@NotBlank(message = "Tax type is required")
	private String taxType;

	@NotNull(message = "Tax percentage is required")
	@Positive(message = "Tax percentage must be positive")
	private Double taxPercentage;

}
