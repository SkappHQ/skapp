package com.skapp.enterprise.invoice.repository.projection;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSummaryData {

	private Long id;

	private String customerName;

	private String email;

	private String country;

}
