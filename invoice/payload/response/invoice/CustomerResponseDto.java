package com.skapp.enterprise.invoice.payload.response.invoice;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CustomerResponseDto {

	private Long id;

	private String name;

	private String email;

	private String address;

	private String country;

	private String vatId;

}
